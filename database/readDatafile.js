import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import { errorHandler } from '../middleware/errorHandler.js'

async function readUserDataFile() {
	try {
		const userData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			'utf8'
		)
		const users = JSON.parse(userData)

		return users
	} catch (err) {
		errorHandler(err, req, res, `Error reading user data: ${err.message}`)
		return []
	}
}

async function readEmpDataFile() {
	try {
		const empData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'employees.json'),
			'utf8'
		)
		const employees = JSON.parse(empData)

		return employees
	} catch (err) {
		errorHandler(err, req, res, `Error reading employee data: ${err.message}`)
		return []
	}
}

export { readUserDataFile, readEmpDataFile }
