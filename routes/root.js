import express from 'express'
import path from 'path'

const rootRouter = express.Router()
const __dirname = import.meta.dirname

rootRouter.get(/^\/$|^\/index(\.html)?$/, (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

export { rootRouter }