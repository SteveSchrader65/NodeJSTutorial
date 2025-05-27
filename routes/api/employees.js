import express from 'express'
import { getAllEmployees, addNewEmployee, updateEmployee, deleteEmployee, getEmployeeByID } from '../../controllers/empController.js'

const empRouter = express.Router()

empRouter.route("/")
  .get(getAllEmployees)
  .post(addNewEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee)

empRouter.route('/:id')
  .get(getEmployeeByID)

export { empRouter }