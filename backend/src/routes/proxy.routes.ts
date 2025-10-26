import { Router } from 'express'
import axios from 'axios'

const proxyRouter = Router()

/**
 * @swagger
 * /api/proxy/image:
 *   get:
 *     tags:
 *       - Proxy
 *     summary: Proxy image requests to bypass CORS
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The image URL to proxy
 *     responses:
 *       200:
 *         description: Image data
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing URL parameter
 *       500:
 *         description: Error fetching image
 */
const schemesList = ["http:", "https:"];
const domainsList = ["trusted1.example.com", "trusted2.example.com"];

proxyRouter.get('/image', async (req, res) => {
  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    const parsedUrl = new URL(url);

    if (!schemesList.includes(parsedUrl.protocol) || !domainsList.includes(parsedUrl.hostname)) {
      return res.status(400).json({ error: 'Invalid URL - only trusted domains allowed' })
    }

    console.log('Proxying image request for:', url)

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
