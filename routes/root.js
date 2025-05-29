import express from 'express'
import path from 'path'
import {getDirname} from '../config/dirname.js'

const rootRouter = express.Router()
const __dirname = getDirname(import.meta.url)

rootRouter.get(/^\/$|^\/index(\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'index.html'))
})

export {rootRouter}