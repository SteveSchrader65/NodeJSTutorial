import express from 'express'
import path from 'path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { corsOptions } from './config/corsOptions.js'
import { logger } from './middleware/logEvents.js'
import { authRouter } from './routes/auth.js'
import { empRouter } from './routes/api/employees.js'
import { refreshRouter } from './routes/refresh.js'
import { regRouter } from './routes/register.js'
import { rootRouter } from './routes/root.js'
import { logoutRouter } from './routes/logout.js'
import { errorHandler } from './middleware/errorHandler.js'
import { verifyJWT } from './middleware/verifyJWT.js'
import { credentials } from './middleware/credentials.js'
import mongoose from 'mongoose'
import { connectDB } from './config/dbConnect.js'

dotenv.config()

const PORT = process.env.PORT || 3500
const app = express()
const __dirname = import.meta.dirname

// Connect to database
// connectDB()

// Custom logger
app.use(logger)

// Cross-Origin Resource Sharing
app.use(credentials)
app.use(cors(corsOptions))

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())

// Serve static files
app.use(express.static(path.join(__dirname, "/public")))

// Routes
app.use('/', rootRouter)
app.use('/auth', authRouter)
app.use('/refresh', refreshRouter)
app.use('/register', regRouter)
app.use('/employees', verifyJWT, empRouter)
app.use('/logout', logoutRouter)

// 404 Page
app.all(/.*/, (req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.status(404).json({error: 'Not found'})
  } else {
    res.status(404).type('txt').send('Not found')
  }
})

// Error handling and logging
app.use(errorHandler)

// Server
// mongoose.connection.once('open', () => {
//   app.listen(PORT, () => console.log(`Connected to MongoDB\nServer running on Port: ${PORT}`))
// })
app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`))

