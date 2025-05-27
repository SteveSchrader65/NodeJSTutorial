import path from "path"
import fs, { promises as fsPromises } from 'fs'
import { getDirname } from '../config/dirname.js'
import { logEvents } from '../middleware/logEvents.js'

// ES modules equivalent of __dirname
const __dirname = getDirname(import.meta.url)

async function readEmpDataFile() {
  try {
    const fileContent = await fsPromises.readFile(path.join(__dirname, "..", "model", "employees.json"), "utf8")
    const empData = JSON.parse(fileContent)

    return empData
  } catch (err) {
    await logEvents(`Error reading employee data: ${err.message}`, "errLog.txt")
    return []
  }
}

async function writeEmpDataFile(data) {
  try {
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "employees.json"),
      JSON.stringify(data, null, 2)
    )
  } catch (err) {
    await logEvents(`Error writing employee data: ${err.message}`, "errLog.txt")
  }
}

const getAllEmployees = async (req, res) => {
  try {
    const employees = await readEmpDataFile()

    res.json(employees)
  } catch (err) {
    await logEvents(`Error retrieving employee data: ${err.message}`, "errLog.txt")
    res.status(500).json({message: "Server error retrieving employees"})
  }}

const addNewEmployee = async (req, res) => {
  const employees = await getAllEmployees()
  const newEmployee = {
    id: employees.length ? employees[employees.length - 1].id + 1 : 1,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  }

  if (!newEmployee.firstName || !newEmployee.lastName) {
    return res.status(400).json({'message': 'First and last names are reequired'})
  }

  const updated = [...employees, newEmployee]

  await writeEmpDataFile(updated)
  res.status(201).json(updated)
}

const updateEmployee = async (req, res) => {
  const employees = await getAllEmployees()
  const employee = employees.find(emp => emp.id === parseInt(req.body.id))

  if (!employee) {
    return res.status(400).json({'message': `Emp ID ${req.body.id} not found`})
  }

  if (req.body.firstName) employee.firstName = req.body.firstName
  if (req.body.lastName) employee.lastName = req.body.lastName

  const filtered = employees.filter(emp => emp.id !== parseInt(req.body.id))
  const updated = [...filtered, employee].sort((a,b) => a.id - b.id)

  await writeEmpDataFile(updated)
  res.json(updated)
}

const deleteEmployee = async (req, res) => {
  try {
    const employees = await readEmpDataFile()
    const filtered = employees.filter(emp => emp.id !== parseInt(req.body.id))

    if (filtered.length === employees.length) {
      return res.status(400).json({message: `Emp ID ${req.body.id} not found`})
    }

    await writeEmpDataFile(filtered)
    res.json(filtered)
  } catch (err) {
    await logEvents(`Error deleting Employee #${req.body.id}: ${err.message}`, "errLog.txt")
    res.status(500).json({message: "Server error deleting employee"})
  }
}

const getEmployeeByID = async (req, res) => {
  try {
    const employees = await readEmpDataFile()
    const employee = employees.find((emp) => emp.id === parseInt(req.params.id))

    if (!employee) {
      return res.status(404).json({message: `Emp ID ${req.params.id} not found`})
    }

    res.json(employee)
  } catch (err) {
    res.status(500).json({message: "Server error retrieving employee"})
  }
}

export {getAllEmployees, addNewEmployee, updateEmployee, deleteEmployee, getEmployeeByID}
