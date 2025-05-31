import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import { logEvents } from '../middleware/logEvents.js'
import { errorHandler } from '../middleware/errorHandler.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

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

const handleLogin = async (req, res) => {
	const users = await readUserDataFile()
	const { user, pwd } = req.body

	if (!user || !pwd)
		return res
			.status(400)
			.json({ success: false, message: 'Username and password are required' })

	const userMatch = users.find(person => person.user === user)

	if (!userMatch) return res.sendStatus(401)

	try {
		const hashMatch = await bcrypt.compare(pwd, userMatch.pwd)

		if (hashMatch) {
			dotenv.config()

			const accessToken = jwt.sign(
				{ user: userMatch.user },
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: '30s' }
			)

			const refreshToken = jwt.sign(
				{ user: userMatch.user },
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: '1d' }
			)

			const otherUsers = users.filter(person => person.user != userMatch.user)
			const currentUser = { ...userMatch, refreshToken }

			await fsPromises.writeFile(
				path.join(__dirname, '..', 'model', 'users.json'),
				JSON.stringify([...otherUsers, currentUser], null, 2)
			)

			res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 86400000 })
			res.json({ success: true, message: `User ${user} has logged-in`, data: accessToken })
			await logEvents(`User ${user} has logged-in`, 'userLog.txt')
		} else {
			res.sendStatus(401)
			await logEvents(`User ${user} failed to log-in - incorrect password`, 'userLog.txt')
		}
	} catch (err) {
		res.sendStatus(401)
		await logEvents(`User ${user} failed to log-in`, 'userLog.txt')
	}
}

export { handleLogin }
