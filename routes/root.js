import express from 'express'
import path from 'path'
import { getDirname } from '../utils/dirname.js'

const rootRouter = express.Router()
const __dirname = getDirname(import.meta.url)

rootRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'root', 'index.html'))
})

rootRouter.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'root', 'index.html'))
})

rootRouter.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'root', 'index.html'))
})

rootRouter.get(/^\/$|^\/index(\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'root', 'index.html'))
})

rootRouter.get(/new-page(\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..',  'views', 'root', 'new-page.html'))
})

rootRouter.get(/old-page(\.html)?$/, (req, res) => {
  res.redirect(301, 'new-page.html')
})

rootRouter.get(/hello(\.html)?$/, (req, res, next) => {
  console.log("Attempted to load hello.html")
  next()
  },
  (req, res) => {
    res.send("Hello world")
  }
)

const one = (req, res, next) => {
  console.log("First")
  next()
}

const two = (req, res, next) => {
  console.log("Second")
  next()
}

const three = (req, res) => {
  console.log("Last")
  res.send("Finished !!")
}

rootRouter.get(/^\/chain(\.html)?$/, [one, two, three])

export { rootRouter }