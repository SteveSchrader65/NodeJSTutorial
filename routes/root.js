import express from 'express'
import path from 'path'
import { getDirname } from '../utils/dirname.js'

// !!! THESE NOT WORKING !!!
const rootRouter = express.Router()
const __dirname = getDirname(import.meta.url)

rootRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

rootRouter.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'index.html'))
})

rootRouter.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'index.html'))
})

rootRouter.get(/^\/$|^\/index(\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'index.html'))
})

rootRouter.get(/new-page(\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'new-page.html'))
})

rootRouter.get(/old-page(\.html)?$/, (req, res) => {
  res.redirect(301, 'new-page.html')
})

export { rootRouter }