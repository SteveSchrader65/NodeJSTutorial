import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import { errorHandler } from '../middleware/errorHandler.js'

// ES modules equivalent of __dirname
const __dirname = import.meta.dirname

async function writeUserDataFile(data) {
	try {
    const sortedData = [...data].sort((a, b) => a.id - b.id)

		await fsPromises.writeFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			JSON.stringify(sortedData, null, 2)
		)
	} catch (err) {
		errorHandler(err, req, res, `Error writing user data: ${err.message}`)
	}
}

async function writeEmpDataFile(data) {
	try {
		await fsPromises.writeFile(
			path.join(__dirname, '..', 'model', 'employees.json'),
			JSON.stringify(data, null, 2)
		)
	} catch (err) {
		errorHandler(err, _, _, `Error writing employee data: ${err.message}`)
	}
}

export { writeUserDataFile, writeEmpDataFile }
