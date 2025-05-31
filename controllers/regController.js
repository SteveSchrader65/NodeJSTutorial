import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import { logEvents } from '../middleware/logEvents.js'
import { errorHandler } from '../middleware/errorHandler.js'
import bcrypt from 'bcryptjs'

// ES modules equivalent of __dirname
const __dirname = import.meta.dirname

async function readUserDataFile() {
	try {
		const userData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			'utf8'
		)
		const users = JSON.parse(userData)

		return users
	} catch (err) {
		errorHandler(`Error reading user data: ${err.message}`)
		return []
	}
}

async function writeUserDataFile(data) {
	try {
		await fsPromises.writeFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			JSON.stringify(data, null, 2)
		)
	} catch (err) {
		errorHandler(`Error writing user data: ${err.message}`)
	}
}

const handleNewUser = async (req, res) => {
	const { user, pwd } = req.body
	const users = await readUserDataFile()

	if (!user || !pwd)
		return res
			.status(400)
			.json({ success: false, message: 'Username and password are required' })

	const duplicate = users.find(person => person.user === user)

	if (duplicate)
		return res.status(409).json({ success: false, message: 'Username already exists' })

	try {
		const hashed = await bcrypt.hash(pwd, 10)

		const newUser = {
			id: users.length ? users[users.length - 1].id + 1 : 1,
			user: user,
			pwd: hashed,
		}

		const updated = [...users, newUser]

		await writeUserDataFile(updated)
		res.status(201).json({
			success: true,
			message: `New user ${user} created ...`,
			user: newUser,
		})

		await logEvents(`New User created: ${user}`, 'userLog.txt')
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
		await logEvents(`Error creating new User: ${err.message}`, 'userLog.txt')
		await logEvents(`Error creating new User: ${err.message}`, 'errLog.txt')
	}
}

export { handleNewUser }