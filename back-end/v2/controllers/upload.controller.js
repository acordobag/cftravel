import fs from 'fs'
import path from 'path'

const uploadDir = path.join(__dirname, '../uploads')
const mimeExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

const cleanName = (value) => (value || 'image')
  .replace(/\.[^/.]+$/, '')
  .replace(/[^a-z0-9-_]+/gi, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase() || 'image'

const Upload = {
  image: async (req, res, next) => {
    try {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(req.body.dataUrl || '')
      if (!match || !mimeExtensions[match[1]]) {
        return res.status(400).json({ message: 'Please upload a JPG, PNG, WebP, or GIF image.' })
      }

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const extension = mimeExtensions[match[1]]
      const fileName = `${Date.now()}-${cleanName(req.body.fileName)}.${extension}`
      fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(match[2], 'base64'))

      res.status(201).json({
        src: `http://localhost:8080/uploads/${fileName}`
      })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Upload
