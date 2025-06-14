import { errorHandler } from '../middleware/errorHandler.js'
import { logEvents } from '../middleware/logEvents.js'
import { readEmpDataFile } from '../database/readDatafile.js'
import { writeEmpDataFile } from '../database/writeDatafile.js'

const getAllEmployees = async (req, res) => {
	try {
		const employees = await readEmpDataFile()

		res.json(employees)
	} catch (err) {
		errorHandler(err, req, res, `Error retrieving employee data: ${err.message}`)
		res.status(500).json({ success: false, message: 'Server error retrieving employee data' })
	}
}

const addNewEmployee = async (req, res) => {
	const employees = await readEmpDataFile()
	const newEmployee = {
		id: employees.length ? employees[employees.length - 1].id + 1 : 1,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
	}

	if (!newEmployee.firstName || !newEmployee.lastName) {
		return res
			.status(400)
			.json({ success: false, message: 'First and last names are required' })
	}

	const updated = [...employees, newEmployee]

	await writeEmpDataFile(updated)
	await logEvents(
		`New Employee created: ${newEmployee.firstName} ${newEmployee.lastName}`,
		'empLog.txt'
	)
	res.status(201).json({
		success: true,
		message: `New employee ${newEmployee.firstName} ${newEmployee.lastName} created`,
		data: newEmployee,
	})
}

const updateEmployee = async (req, res) => {
	try {
		const employees = await readEmpDataFile()
		const employee = employees.find(emp => emp.id === parseInt(req.body.id))

		if (!employee) {
			return res
				.status(400)
				.json({ success: false, message: `Emp ID ${req.body.id} not found` })
		}

		if (req.body.firstName) employee.firstName = req.body.firstName
		if (req.body.lastName) employee.lastName = req.body.lastName

		const filtered = employees.filter(emp => emp.id !== parseInt(req.body.id))
		const updated = [...filtered, employee].sort((a, b) => a.id - b.id)

		await writeEmpDataFile(updated)
		await logEvents(`Employee ${employee.firstName} ${employee.lastName} updated`, 'empLog.txt')
		res.status(200).json({
			success: true,
			message: `Employee ${employee.firstName} ${employee.lastName} updated`,
			data: updated,
		})
	} catch (err) {
		errorHandler(err, req, res, `Error updating employee: ${err.message}`)
		res.status(500).json({ success: false, message: 'Server error updating employee' })
	}
}

const deleteEmployee = async (req, res) => {
	try {
		const employees = await readEmpDataFile()
		const employee = employees.find(emp => emp.id === parseInt(req.params.id))
		const filtered = employees.filter(emp => emp.id !== parseInt(req.params.id))

		if (filtered.length === employees.length) {
			return res
				.status(400)
				.json({ success: false, message: `Emp ID ${req.params.id} not found` })
		}

		await writeEmpDataFile(filtered)
		await logEvents(`Employee ${employee.firstName} ${employee.lastName} deleted`, 'empLog.txt')
		res.status(200).json({
			success: true,
			message: `Employee ${employee.firstName} ${employee.lastName} deleted`,
		})
	} catch (err) {
		errorHandler(err, req, res, `Error deleting Employee #${req.params.id}: ${err.message}`)
		res.status(500).json({ success: false, message: 'Server error deleting employee' })
	}
}

const getEmployeeByID = async (req, res) => {
	try {
		const employees = await readEmpDataFile()
		const employee = employees.find(emp => emp.id === parseInt(req.params.id))

		if (!employee) {
			return res
				.status(404)
				.json({ success: false, message: `Emp ID ${req.params.id} not found` })
		}

		res.json(employee)
	} catch (err) {
		errorHandler(err, req, res, `Error retrieving Employee #${req.params.id}: ${err.message}`)
		res.status(500).json({ success: false, message: 'Server error retrieving employee' })
	}
}

export { getAllEmployees, addNewEmployee, updateEmployee, deleteEmployee, getEmployeeByID }
