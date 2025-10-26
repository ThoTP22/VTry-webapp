import { Router } from 'express'
import axios from 'axios'

const proxyRouter = Router()

/**
 * @swagger
 * /api/proxy/image:
 *   get:
 *     tags:
 *       - Proxy
 *     summary: Proxy image requests to bypass CORS (with security validation)
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The image URL to proxy (must be from trusted domains)
 *     responses:
 *       200:
 *         description: Image data
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing URL parameter or invalid URL
 *       500:
 *         description: Error fetching image
 */

// Security whitelist - only allow trusted schemes and domains
const allowedSchemes = new Set(["http:", "https:"]);
const allowedDomains = new Set([
  "images.unsplash.com",
  "source.unsplash.com", 
  "picsum.photos",
  "via.placeholder.com",
  "i.imgur.com",
  "cdn.shopify.com",
  "storage.googleapis.com",
  "firebasestorage.googleapis.com",
  "s3.amazonaws.com"
]);

proxyRouter.get('/image', async (req, res) => {
  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    // Parse and validate URL safely
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      console.error('Invalid URL format provided:', url, error);
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Security check: Only allow whitelisted schemes and domains
    if (!allowedSchemes.has(parsedUrl.protocol) || !allowedDomains.has(parsedUrl.hostname)) {
      console.warn('Blocked unsafe URL attempt:', url);
      return res.status(400).json({ 
        error: 'Invalid URL - only trusted domains allowed',
        allowedDomains: Array.from(allowedDomains) 
      })
    }

    console.log('Proxying image request for validated URL:', url)

    // Fetch the image
    const response = await axios.get(url, { 
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    })

    // Pipe the image data
    response.data.pipe(res)
  } catch (error: any) {
    console.error('Proxy image error:', error)

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(404).json({ error: 'Image not found or unreachable' })
    }

    if (error.response?.status) {
      return res.status(error.response.status).json({
        error: `Upstream error: ${error.response.status}`
      })
    }

    res.status(500).json({ error: 'Failed to fetch image' })
  }
})

export default proxyRouter
