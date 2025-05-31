import express from 'express'
import { handleLogout } from '../controllers/logoutController'

const logoutRouter = express.Router()

logoutRouter.post('/', handleLogout)

export { regRouter }