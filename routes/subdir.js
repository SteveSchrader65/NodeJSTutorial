import express from 'express'
import path from 'path'
import { getDirname } from '../utils/dirname.js'

const subDirRouter = express.Router()
const __dirname = getDirname(import.meta.url)

subDirRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'subdir', 'index.html'))
})

subDirRouter.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'subdir', 'index.html'))
})

subDirRouter.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'subdir', 'index.html'))
})

subDirRouter.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'subdir', 'test.html'))
})

subDirRouter.get('/test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'subdir', 'test.html'))
})

export { subDirRouter }