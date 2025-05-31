import express from 'express'
import { handleNewUser } from '../controllers/regController.js'

const regRouter = express.Router()

regRouter.post('/', handleNewUser)

export { regRouter }