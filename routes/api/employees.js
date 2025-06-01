import express from 'express'
import { getAllEmployees, addNewEmployee, updateEmployee, deleteEmployee, getEmployeeByID } from '../../controllers/employeeController.js'
import { ROLES_LIST } from '../../config/rolesList.js'
import { verifyRoles } from '../../middleware/verifyRoles.js'

const empRouter = express.Router()

empRouter
	.route('/')
	.get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), getAllEmployees)
	.post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), addNewEmployee)

empRouter
	.route('/:id')
	.get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), getEmployeeByID)
	.put(verifyRoles(ROLES_LIST.Admin), updateEmployee)
	.delete(verifyRoles(ROLES_LIST.Admin), deleteEmployee)

export { empRouter }