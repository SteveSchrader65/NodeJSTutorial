import fs, {promises as fsPromises} from 'fs'
import path from 'path'
import { getDirname } from '../utils/dirname.js'
import { logEvents } from '../middleware/logEvents.js'

// ES modules equivalent of __dirname
const __dirname = getDirname(import.meta.url)

async function readEmpDataFile() {
  try {
    const fileContent = await fsPromises.readFile(
      path.join(__dirname, "..", "model", "employees.json"),
      "utf8"
    )

    const empData = JSON.parse(fileContent)

    return empData
  } catch (err) {
    await logEvents(`Error reading employee data: ${err.message}`, "errLog.txt")
    return []
  }
}

const getAllEmployees = async (req, res) => {
  res.json(await readEmpDataFile())
}

const addNewEmployee = (req, res) => {
  res.json({
    id: req.body.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  })
}

const updateEmployee = (req, res) => {
  res.json({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  })
}

const deleteEmployee = (req, res) => {
  res.json({id: req.body.id})
}

const getEmployeeByID = async (req, res) => {
  const employees = await readEmpDataFile()
  const employee = employees.find((emp) => emp.id == req.params.id)

  if (employee) {
    res.json(employee)
  } else {
    await logEvents(`404 Error: Employee with ID ${req.params.id} not found`, "errLog.txt")
    res.status(404).json({error: "Employee not found"})
  }
}

export { getAllEmployees, addNewEmployee, updateEmployee, deleteEmployee, getEmployeeByID }