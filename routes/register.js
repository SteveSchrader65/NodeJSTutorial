import express from 'express'
import { handleNewUser } from '../controllers/registerController.js'

const regRouter = express.Router()

regRouter.post('/', handleNewUser)

export { regRouter }