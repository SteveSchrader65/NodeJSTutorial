import express from 'express'
import fs, {promises as fsPromises} from "fs"
import path from 'path'
import { getDirname } from '../../utils/dirname.js'
import { logEvents } from '../../middleware/logEvents.js'

// ES modules equivalent of __dirname
const __dirname = getDirname(import.meta.url)
const empRouter = express.Router()

async function readEmpDataFile() {
  try {
    const fileContent = await fsPromises.readFile(path.join(__dirname, '../..', 'data', 'employees.json'), 'utf8')
    const empData = JSON.parse(fileContent)

    return empData
  } catch(err) {
    await logEvents(`Error reading employee data: ${err.message}`, 'errLog.txt');
    return [];
  }
}

empRouter.route("/")
  .get(async (req, res) => {res.json(await readEmpDataFile())})
  .post((req, res) => {res.json({
    id: req.body.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  })})
  .put((req, res) => {res.json({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  })})
  .delete((req, res) => {
    res.json({id: req.body.id})
  })

empRouter.route('/:id')
  .get(async (req, res) => {
    const employees = await readEmpDataFile()
    const employee = employees.find(emp=>emp.id==req.params.id)

    if (employee) {
    res.json(employee)
} else {
    await logEvents(`404 Error: Employee with ID ${req.params.id} not found`, 'errLog.txt');
    res.status(404).json({error: "Employee not found"})
  }
})

export { empRouter }