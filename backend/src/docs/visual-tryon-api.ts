/**
 * @swagger
 * components:
 *   schemas:
 *     TryOnOneStopRequest:
 *       type: object
 *       required:
 *         - file
 *         - garment_image_url
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: Model image file upload (ảnh người mẫu) - Tối đa 10MB
 *         garment_image_url:
 *           type: string
 *           format: uri
 *           description: URL của ảnh quần áo cần thử (phải publicly accessible)
 *           example: "https://example.com/garment.jpg"
 *         mode:
 *           type: string
 *           enum: [performance, balanced, quality]
 *           default: balanced
 *           description: |
 *             Chế độ xử lý - ảnh hưởng đến tốc độ vs chất lượng:
 *             - performance: ~5 giây, chất lượng thấp
 *             - balanced: ~8 giây, cân bằng tốc độ và chất lượng
 *             - quality: ~12-17 giây, chất lượng cao nhất
 *         num_samples:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           default: 1
 *           description: Số lượng ảnh kết quả được tạo (tăng tỷ lệ có kết quả tốt)
 *         output_format:
 *           type: string
 *           enum: [png, jpeg]
 *           default: jpeg
 *           description: |
 *             Định dạng ảnh đầu ra:
 *             - png: Chất lượng cao nhất, kích thước lớn
 *             - jpeg: Nhanh hơn, kích thước nhỏ, phù hợp real-time
 *         category:
 *           type: string
 *           enum: [auto, tops, bottoms, one-pieces]
 *           default: auto
 *           description: |
 *             Loại quần áo để tự động detect:
 *             - auto: Tự động phân loại
 *             - tops: Áo (phần trên)
 *             - bottoms: Quần (phần dưới)
 *             - one-pieces: Váy/jumpsuit
 *         segmentation_free:
 *           type: boolean
 *           default: true
 *           description: |
 *             Fitting trực tiếp không cần phân đoạn quần áo.
 *             Tốt cho quần áo bulky, giữ được body shape và skin texture.
 *             Set false nếu quần áo gốc không được remove đúng cách.
 *         moderation_level:
 *           type: string
 *           enum: [conservative, permissive, none]
 *           default: permissive
 *           description: |
 *             Mức độ kiểm duyệt nội dung:
 *             - conservative: Nghiêm ngặt, block underwear/swimwear
 *             - permissive: Cho phép swimwear, block explicit content
 *             - none: Không kiểm duyệt (cần tuân thủ ToS)
 *         garment_photo_type:
 *           type: string
 *           enum: [auto, flat-lay, model]
 *           default: auto
 *           description: |
 *             Loại ảnh quần áo để tối ưu parameters:
 *             - auto: Tự động detect
 *             - flat-lay: Ảnh quần áo phẳng hoặc ghost mannequin
 *             - model: Ảnh quần áo trên người mẫu
 *         seed:
 *           type: integer
 *           minimum: 0
 *           maximum: 4294967295
 *           description: Random seed để có kết quả tái tạo được (cùng input + seed = cùng output)
 *
 *     TryOnOneStopResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           description: Trạng thái thành công
 *           example: true
 *         prediction_id:
 *           type: string
 *           description: FASHN AI prediction ID để tracking
 *           example: "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: |
 *             Mảng các S3 presigned URLs của ảnh kết quả.
 *             URLs có thời hạn 1 giờ.
 *           example:
 *             - "https://s3.amazonaws.com/bucket/tryon-outputs/pred123/output_0.jpg?signature=..."
 *         count:
 *           type: integer
 *           description: Số lượng ảnh được tạo
 *           example: 1
 *
 *     TryOnErrorResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Thông báo lỗi chi tiết
 *         error:
 *           type: object
 *           description: Chi tiết lỗi từ FASHN API (nếu có)
 *           properties:
 *             name:
 *               type: string
 *               enum: [ImageLoadError, ContentModerationError, PoseError, PipelineError, ThirdPartyError]
 *             message:
 *               type: string
 *         status:
 *           type: integer
 *           description: HTTP status từ upstream service (nếu có)
 *         body:
 *           type: string
 *           description: Raw response body từ upstream (nếu có)
 */

/**
 * @swagger
 * /api/visual-tryon/tryon:
 *   post:
 *     tags:
 *       - Visual Try-On
 *     summary: Virtual try-on một bước (One-Stop) - FASHN AI v1.6
 *     description: |
 *       Upload ảnh người mẫu và URL ảnh quần áo để tạo virtual try-on sử dụng FASHN AI v1.6.
 *       API này xử lý toàn bộ workflow từ upload, gọi FASHN AI, đến lưu kết quả lên S3.
 *
 *       **🔄 Quy trình xử lý:**
 *       1. Validate inputs và upload model image lên S3
 *       2. Tạo presigned URL cho FASHN AI đọc model image
 *       3. Gọi FASHN API `/v1/run` với model `tryon-v1.6`
 *       4. Poll `/v1/status/{id}` đến khi `completed` hoặc `failed`
 *       5. Download ảnh kết quả từ FASHN CDN và re-host lên S3
 *       6. Trả về presigned URLs cho client (thời hạn 1 giờ)
 *
 *       **⚡ Thời gian xử lý (depends on mode):**
 *       - Performance: ~5-15 giây
 *       - Balanced: ~8-30 giây (recommended)
 *       - Quality: ~12-60 giây
 *
 *       **📋 Requirements:**
 *       - Model image: File upload, max 10MB, formats: JPG/PNG/WebP
 *       - Garment image: Publicly accessible URL, preferably square aspect ratio
 *       - TRYON_API_KEY: Valid FASHN AI API key
 *       - AWS S3: Configured for image storage
 *
 *       **🔒 Rate Limits:**
 *       - Processing: 6 concurrent requests max
 *       - FASHN API: 50 requests/60s for `/run`, 50 requests/10s for `/status`
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/TryOnOneStopRequest'
 *           example:
 *             file: "[binary model image file]"
 *             garment_image_url: "https://example.com/dress.jpg"
 *             mode: "balanced"
 *             num_samples: 1
 *             output_format: "jpeg"
 *             category: "auto"
 *             segmentation_free: true
 *     responses:
 *       200:
 *         description: ✅ Try-on hoàn thành thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TryOnOneStopResponse'
 *             example:
 *               ok: true
 *               prediction_id: "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1"
 *               images:
 *                 - "https://s3.amazonaws.com/bucket/tryon-outputs/123a87r9/output_0.jpg?AWSAccessKeyId=..."
 *               count: 1
 *       400:
 *         description: ❌ Lỗi đầu vào - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TryOnErrorResponse'
 *             examples:
 *               missing_file:
 *                 summary: Thiếu file upload
 *                 value:
 *                   ok: false
 *                   message: "Cần có file (model image) và garment_image_url"
 *               invalid_url:
 *                 summary: URL quần áo không hợp lệ
 *                 value:
 *                   ok: false
 *                   message: "garment_image_url không hợp lệ"
 *               file_too_large:
 *                 summary: File quá lớn
 *                 value:
 *                   ok: false
 *                   message: "File ảnh quá lớn. Kích thước tối đa là 10MB"
 *               invalid_file_type:
 *                 summary: Không phải file ảnh
 *                 value:
 *                   ok: false
 *                   message: "Chỉ chấp nhận file ảnh"
 *               invalid_parameters:
 *                 summary: Parameters không hợp lệ
 *                 value:
 *                   ok: false
 *                   message: "num_samples phải từ 1 đến 4"
 *       422:
 *         description: ❌ FASHN API processing error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TryOnErrorResponse'
 *             examples:
 *               image_load_error:
 *                 summary: Không thể load ảnh
 *                 value:
 *                   ok: false
 *                   message: "Tryon API failed (sync error)"
 *                   error:
 *                     name: "ImageLoadError"
 *                     message: "Error loading model image: The URL's Content-Type is not an image"
 *               content_moderation_error:
 *                 summary: Nội dung bị kiểm duyệt
 *                 value:
 *                   ok: false
 *                   message: "Tryon API failed (sync error)"
 *                   error:
 *                     name: "ContentModerationError"
 *                     message: "Prohibited content detected in garment image"
 *               pose_error:
 *                 summary: Không detect được pose
 *                 value:
 *                   ok: false
 *                   message: "Tryon API failed (sync error)"
 *                   error:
 *                     name: "PoseError"
 *                     message: "Unable to detect body pose in model image"
 *       500:
 *         description: ❌ Lỗi server nội bộ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TryOnErrorResponse'
 *             examples:
 *               timeout:
 *                 summary: Timeout xử lý
 *                 value:
 *                   ok: false
 *                   message: "Timeout: Try-on still processing after MAX_WAIT_MS"
 *               config_error:
 *                 summary: Server configuration error
 *                 value:
 *                   ok: false
 *                   message: "Server configuration error: TRYON_API_KEY not configured"
 *               s3_error:
 *                 summary: Lỗi S3 upload/download
 *                 value:
 *                   ok: false
 *                   message: "S3 upload failed"
 *               download_error:
 *                 summary: Lỗi download kết quả
 *                 value:
 *                   ok: false
 *                   message: "Download output failed 404: Not Found"
 *       502:
 *         description: ❌ Lỗi FASHN API upstream
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TryOnErrorResponse'
 *             examples:
 *               fashn_api_error:
 *                 summary: FASHN API không available
 *                 value:
 *                   ok: false
 *                   message: "FASHN /v1/run HTTP error"
 *                   status: 502
 *                   body: "Service temporarily unavailable"
 *               status_api_error:
 *                 summary: FASHN status API error
 *                 value:
 *                   ok: false
 *                   message: "FASHN /status HTTP 404: 404 Not Found"
 *
 * /api/visual-tryon/analysis:
 *   post:
 *     tags:
 *       - Visual Try-On
 *     summary: 🚨 Legacy endpoint (Deprecated)
 *     description: |
 *       **⚠️ DEPRECATED:** Endpoint này được giữ lại để tương thích ngược.
 *       **👉 Vui lòng sử dụng `/api/visual-tryon/tryon` thay thế.**
 *
 *       Hoạt động giống hệt như `/api/visual-tryon/tryon` nhưng sẽ bị remove trong tương lai.
 *
 *       **📅 Deprecation Timeline:**
 *       - Hiện tại: Vẫn hoạt động bình thường
 *       - Q4 2025: Sẽ có warning trong response
 *       - Q1 2026: Có thể bị remove
 *     deprecated: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/TryOnOneStopRequest'
 *     responses:
 *       200:
 *         description: Try-on thành công (giống như /tryon)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TryOnOneStopResponse'
 *       400:
 *         $ref: '#/paths/~1api~1visual-tryon~1tryon/post/responses/400'
 *       422:
 *         $ref: '#/paths/~1api~1visual-tryon~1tryon/post/responses/422'
 *       500:
 *         $ref: '#/paths/~1api~1visual-tryon~1tryon/post/responses/500'
 *       502:
 *         $ref: '#/paths/~1api~1visual-tryon~1tryon/post/responses/502'
 */

/**
 * @swagger
 * tags:
 *   - name: Visual Try-On
 *     description: |
 *       ## 🎯 FASHN AI Virtual Try-On Integration
 *
 *       Comprehensive virtual try-on solution sử dụng FASHN AI v1.6 model.
 *
 *       ### 📚 Quick Start Guide
 *
 *       1. **Prepare Images:**
 *          - Model image: Upload file (max 10MB, JPG/PNG/WebP)
 *          - Garment image: Public URL, preferably square ratio
 *
 *       2. **Choose Parameters:**
 *          - `mode`: `balanced` (recommended) cho most use cases
 *          - `output_format`: `jpeg` cho web, `png` cho highest quality
 *          - `num_samples`: `1-4` để tăng chance có good result
 *
 *       3. **Make Request:**
 *          ```bash
 *          curl -X POST "/api/visual-tryon/tryon" \
 *            -F "file=@model.jpg" \
 *            -F "garment_image_url=https://example.com/dress.jpg" \
 *            -F "mode=balanced"
 *          ```
 *
 *       4. **Handle Response:**
 *          - Success: `ok: true` + array of image URLs
 *          - Error: `ok: false` + detailed error message
 *
 *       ### ⚡ Performance Expectations
 *
 *       | Mode | Time | Quality | Best For |
 *       |------|------|---------|----------|
 *       | performance | ~5-15s | Basic | Quick previews, mobile apps |
 *       | balanced | ~8-30s | Good | Most web applications |
 *       | quality | ~12-60s | Excellent | High-end fashion, marketing |
 *
 *       ### 🚨 Common Issues & Solutions
 *
 *       | Error | Cause | Solution |
 *       |-------|-------|----------|
 *       | `ImageLoadError` | URL không accessible | Ensure public URL, check CORS |
 *       | `ContentModerationError` | Restricted content | Adjust `moderation_level` |
 *       | `PoseError` | Không detect body | Use clear, full-body model photos |
 *       | `404` on status | Invalid prediction ID | Check `/v1/run` response |
 *       | `Timeout` | Processing quá lâu | Try `performance` mode |
 *
 *       ### 🔧 Environment Setup
 *
 *       Required environment variables:
 *       ```env
 *       TRYON_API_KEY=your_fashn_api_key
 *       AWS_REGION=your_aws_region
 *       AWS_ACCESS_KEY_ID=your_access_key
 *       AWS_SECRET_ACCESS_KEY=your_secret_key
 *       AWS_S3_BUCKET_NAME=your_bucket_name
 *       ```
 *
 *       ### 📞 Support & Testing
 *
 *       - **Test endpoints**: `/api/test/visual-tryon-test`, `/api/test/fashn-status-test`
 *       - **Rate limits**: 6 concurrent, 50 req/min for run, 50 req/10s for status
 *       - **Image retention**: S3 URLs valid for 1 hour
 *       - **FASHN CDN**: Original URLs valid for 72 hours
 *
 *       ### 🔗 Related Resources
 *
 *       - [FASHN AI Documentation](https://docs.fashn.ai/api-reference/tryon-v1-6)
 *       - [Image Best Practices](https://docs.fashn.ai/guides/image-preprocessing-best-practices)
 *       - [Try-on Parameters Guide](https://docs.fashn.ai/guides/tryon-parameters-guide)
 */
