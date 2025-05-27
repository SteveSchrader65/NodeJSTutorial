import express from 'express'
import path from 'path'
import cors from 'cors'
import { getDirname } from './utils/dirname.js'
import { logger } from './middleware/logEvents.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rootRouter } from './routes/root.js'
import { subDirRouter } from './routes/subdir.js'

const PORT = process.env.PORT || 3500
const app = express()
const __dirname = getDirname(import.meta.url)

// Custom middleware logger
app.use(logger)

// CrossOrigin Resource Sharing
const whiteList = ['https://www.google.com', 'http://127.0.0.1:5500', 'http://localhost:3500']
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('CORS: Not permitted'))
    }
  },
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Serve static files
app.use(express.static(path.join(__dirname, '/public')))
app.use('/subdir', express.static(path.join(__dirname, '/public')))

// Serve HTML files
app.use('/', rootRouter)
app.use('/subdir', subDirRouter)

app.get(/hello(\.html)?$/, (req, res, next) => {
  console.log("Attempted to load hello.html")
  next()
}, (req, res) => {
  res.send('Hello world')
})

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

app.get(/^\/chain(\.html)?$/, [one, two, three])

app.all(/.*/, (req, res) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"))
  } else if (req.accepts("json")) {
    res.status(404).json({error: "Not found"})
  } else {
    res.status(404).type("txt").send("Not found")
  }
})

// Error handling and logging
app.use(errorHandler)

// Server
app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`))
