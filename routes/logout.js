import express from 'express'
import { handleLogout } from '../controllers/logoutController.js'
import { ROLES_LIST } from '../config/rolesList.js'
import { verifyRoles } from '../middleware/verifyRoles.js'

const logoutRouter = express.Router()

logoutRouter.route('/').get(verifyRoles(ROLES_LIST.User), handleLogout)

export { logoutRouter }