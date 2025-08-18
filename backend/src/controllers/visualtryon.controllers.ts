import type { Request, Response, NextFunction } from 'express'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// ===== Config theo FASHN AI Documentation =====
const FASHN_RUN_URL = 'https://api.fashn.ai/v1/run'
const FASHN_STATUS_URL = 'https://api.fashn.ai/v1/status/' // Fixed: đúng format theo docs

const DEFAULT_MODE: 'performance' | 'balanced' | 'quality' = 'balanced'
const DEFAULT_NUM_SAMPLES = 1
const MAX_WAIT_MS = 90_000 // tổng thời gian chờ tối đa (quality có thể cần 120s)
const BASE_DELAY_MS = 2000 // poll interval khởi điểm (theo docs rate limit: 50 req/10s)
const BACKOFF_FACTOR = 1.5 // backoff

// helper: poll trạng thái đến khi xong/failed/timeout - theo FASHN API docs
async function pollTryOnStatus(predictionId: string, apiKey: string) {
  let delay = BASE_DELAY_MS
  const deadline = Date.now() + MAX_WAIT_MS

  console.log(`[TryOn] Starting status polling for prediction: ${predictionId}`)

  while (Date.now() < deadline) {
    const statusUrl = `${FASHN_STATUS_URL}${encodeURIComponent(predictionId)}`
    console.log(`[TryOn] Polling status: ${statusUrl}`)

    const resp = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })

    if (!resp.ok) {
      const t = await resp.text().catch(() => '')
      console.error(`[TryOn] Status API error: ${resp.status} - ${t}`)
      throw new Error(`FASHN /status HTTP ${resp.status}: ${t}`)
    }

    const json = await resp.json()
    console.log(`[TryOn] Status response:`, JSON.stringify(json, null, 2))

    // Handle status according to FASHN docs
    switch (json.status) {
      case 'completed': {
        console.log(`[TryOn] Processing completed successfully`)
        return json.output as string[] // CDN URLs
      }

      case 'failed': {
        const msg = json?.error?.message ?? 'Unknown error'
        const name = json?.error?.name ?? 'PipelineError'
        console.error(`[TryOn] Processing failed: ${name} - ${msg}`)
        throw new Error(`${name}: ${msg}`)
      }

      case 'starting':
      case 'in_queue':
      case 'processing': {
        console.log(`[TryOn] Status: ${json.status}, waiting ${delay}ms...`)
        break
      }

      default: {
        console.warn(`[TryOn] Unknown status: ${json.status}`)
      }
    }

    // Wait before next poll (respect rate limits)
    await new Promise((r) => setTimeout(r, delay))
    delay = Math.min(Math.floor(delay * BACKOFF_FACTOR), 8000) // Max 8s between polls
  }

  throw new Error('Timeout: Try-on still processing after MAX_WAIT_MS')
}

// helper: tải 1 ảnh (CDN) về buffer + content-type
async function downloadImageToBuffer(url: string): Promise<{ buf: Buffer; contentType: string | undefined }> {
  const r = await fetch(url)
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`Download output failed ${r.status}: ${t}`)
  }
  const contentType = r.headers.get('content-type') || undefined
  const ab = await r.arrayBuffer()
  return { buf: Buffer.from(ab), contentType }
}

export const tryonOneStopController = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Check API key first
    if (!process.env.TRYON_API_KEY) {
      console.error('[TryOn] TRYON_API_KEY not found in environment variables')
      return res.status(500).json({
        ok: false,
        message: 'Server configuration error: TRYON_API_KEY not configured'
      })
    }

    // Multer single('file') → req.file
    const file = (req as any).file as Express.Multer.File
    const {
      garment_image_url,
      mode = DEFAULT_MODE,
      num_samples = DEFAULT_NUM_SAMPLES,
      output_format = 'jpeg', // bạn muốn URL, không base64
      category,
      segmentation_free,
      moderation_level,
      garment_photo_type,
      seed
    } = req.body

    // Validation đã được xử lý bởi middleware
    if (!file || !garment_image_url) {
      return res.status(400).json({
        ok: false,
        message: 'Cần có file (model image) và garment_image_url'
      })
    }

    // Validate các tham số optional
    if (num_samples && (num_samples < 1 || num_samples > 4)) {
      return res.status(400).json({
        ok: false,
        message: 'num_samples phải từ 1 đến 4'
      })
    }

    if (mode && !['performance', 'balanced', 'quality'].includes(mode)) {
      return res.status(400).json({
        ok: false,
        message: 'mode phải là performance, balanced, hoặc quality'
      })
    }

    if (output_format && !['png', 'jpeg'].includes(output_format)) {
      return res.status(400).json({
        ok: false,
        message: 'output_format phải là png hoặc jpeg'
      })
    }

    console.log(`[TryOn] Starting processing - mode: ${mode}, samples: ${num_samples}, format: ${output_format}`)

    // === 1) Upload model image lên S3 với public read access ===
    const s3 = new S3Client({ region: process.env.AWS_REGION })
    const bucket = process.env.AWS_S3_BUCKET_NAME!
    const modelKey = `tryon-inputs/${Date.now()}-${file.originalname}`

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: modelKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read' // Cho phép public access
        })
      )
      console.log(`[TryOn] Model image uploaded to S3 with public access: ${modelKey}`)
    } catch (aclError) {
      // Nếu ACL fails, thử upload mà không có ACL (rely on bucket policy)
      console.warn(`[TryOn] ACL upload failed, trying without ACL:`, aclError)
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: modelKey,
          Body: file.buffer,
          ContentType: file.mimetype
        })
      )
      console.log(`[TryOn] Model image uploaded to S3 (no ACL): ${modelKey}`)
    }

    // === 2) Tạo public URL cho FASHN đọc ảnh (không dùng presigned URL) ===
    // FASHN AI cần URL public, không thể dùng presigned URL
    const modelImageReadUrl = `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${modelKey}`

    console.log(`[TryOn] Model image public URL: ${modelImageReadUrl}`)

    // Verify URL accessibility before sending to FASHN
    try {
      const testResponse = await fetch(modelImageReadUrl, { method: 'HEAD' })
      if (!testResponse.ok) {
        console.error(`[TryOn] Model image not accessible: ${testResponse.status}`)
        return res.status(500).json({
          ok: false,
          message: `Uploaded model image not accessible (${testResponse.status}). Please check S3 bucket permissions.`
        })
      }
      console.log(`[TryOn] Model image accessibility verified`)
    } catch (error) {
      console.error(`[TryOn] Error verifying model image accessibility:`, error)
      return res.status(500).json({
        ok: false,
        message: 'Cannot verify model image accessibility. Please check S3 configuration.'
      })
    }

    // === 3) Gọi /v1/run (return_base64 = false để nhận CDN URL) ===
    const runPayload = {
      model_name: 'tryon-v1.6',
      inputs: {
        model_image: modelImageReadUrl,
        garment_image: garment_image_url,
        output_format,
        mode,
        num_samples: Number(num_samples),
        ...(category ? { category } : {}),
        ...(segmentation_free !== undefined
          ? { segmentation_free: segmentation_free === 'true' || segmentation_free === true }
          : {}),
        ...(moderation_level ? { moderation_level } : {}),
        ...(garment_photo_type ? { garment_photo_type } : {}),
        ...(seed !== undefined ? { seed: Number(seed) } : {})
        // return_base64: false  (mặc định là false)
      }
    }

    console.log(`[TryOn] Calling FASHN API with payload:`, JSON.stringify(runPayload, null, 2))

    const runResp = await fetch(FASHN_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TRYON_API_KEY}`
      },
      body: JSON.stringify(runPayload)
    })

    if (!runResp.ok) {
      const t = await runResp.text().catch(() => '')
      console.error(`[TryOn] FASHN /v1/run HTTP error: ${runResp.status}`, t)
      return res.status(502).json({
        ok: false,
        message: 'FASHN /v1/run HTTP error',
        status: runResp.status,
        body: t
      })
    }

    const { id, error } = await runResp.json()
    if (error) {
      console.error(`[TryOn] FASHN API sync error:`, error)
      return res.status(422).json({
        ok: false,
        message: 'Tryon API failed (sync error)',
        error
      })
    }

    console.log(`[TryOn] FASHN prediction started: ${id}`)

    // === 4) Poll /status đến khi completed/failed ===
    const outputs = await pollTryOnStatus(id, process.env.TRYON_API_KEY!) // array CDN URLs
    console.log(`[TryOn] Processing completed, received ${outputs.length} outputs`)

    // === 5) Tải từng ảnh kết quả và re-host lên S3 ===
    const resultKeys: string[] = []
    for (let i = 0; i < outputs.length; i++) {
      const outUrl = outputs[i]
      console.log(`[TryOn] Downloading output ${i}: ${outUrl}`)
      const { buf, contentType } = await downloadImageToBuffer(outUrl)

      const ext = output_format === 'png' ? 'png' : 'jpg'
      const key = `tryon-outputs/${id}/output_${i}.${ext}`

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buf,
            ContentType: contentType ?? (ext === 'png' ? 'image/png' : 'image/jpeg'),
            ACL: 'public-read' // Cho phép public access
          })
        )
        console.log(`[TryOn] Uploaded output ${i} to S3 with public access: ${key}`)
      } catch (aclError) {
        // Fallback without ACL
        console.warn(`[TryOn] ACL upload failed for output ${i}, trying without ACL:`, aclError)
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buf,
            ContentType: contentType ?? (ext === 'png' ? 'image/png' : 'image/jpeg')
          })
        )
        console.log(`[TryOn] Uploaded output ${i} to S3 (no ACL): ${key}`)
      }
      resultKeys.push(key)
    }

    // === 6) Tạo public URLs cho output images ===
    const resultUrls = resultKeys.map(
      (k) => `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${k}`
    )

    console.log(`[TryOn] Generated ${resultUrls.length} public URLs:`, resultUrls)

    return res.status(200).json({
      ok: true,
      prediction_id: id,
      images: resultUrls, // các URL S3 (presigned GET)
      count: resultUrls.length
    })
  } catch (err: any) {
    console.error('tryonOneStopController error:', err)
    return res.status(500).json({
      ok: false,
      message: err?.message ?? 'Internal Server Error'
    })
  }
}
