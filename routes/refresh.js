import express from 'express'
import { handleRefresh } from '../controllers/refreshController.js'

const refreshRouter = express.Router()

refreshRouter.get('/', handleRefresh)

export { refreshRouter }
