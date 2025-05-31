import express from 'express'
import { handleRefreshToken } from '../controllers/refreshController.js'

const refreshRouter = express.Router()

refreshRouter.get('/', handleRefreshToken)

export { refreshRouter }
