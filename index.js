import { convert } from './controllers/convert.js'
import express from 'express'
import multer from 'multer'
import pkg from './package.json' with { type: 'json' }

const storage = multer.memoryStorage()
const upload = multer({ storage })

const app = express()
const port = 8080

app.set('view engine', 'pug')

app.get('/', (_req, res) => {
  res.render('index', { version: pkg.version })
})

app.post('/convert', upload.single('xlsx'), (req, res) => {
  if (!req.file) return res.redirect('/')

  const ofx = convert(req.file)

  res.set({
    'Content-Type': 'text/plain',
    'Content-Disposition': `attachment; filename=${ofx.filename}`
  })

  res.send(Buffer.from(ofx.content))
})

app.listen(port, () => {
  console.log(`Application available on http://localhost:${port}`)
})
