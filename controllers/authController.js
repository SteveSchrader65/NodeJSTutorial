import path from 'path'
import { promises as fsPromises } from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { logEvents } from '../middleware/logEvents.js'
import { readUserDataFile } from '../database/readDatafile.js'

// ES modules equivalent of __dirname
const __dirname = import.meta.dirname

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

      const roles = Object.values(userMatch.roles)

			const accessToken = jwt.sign(
				{
					UserInfo: {
						user: userMatch.user,
						roles: roles,
					},
				},
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
      // const isProduction = process.env.NODE_ENV === 'production'

			await fsPromises.writeFile(
				path.join(__dirname, '..', 'model', 'users.json'),
				JSON.stringify([...otherUsers, currentUser], null, 2)
			)

			res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', /*secure: true,*/ /*secure: isProduction,*/ maxAge: 86400000 })
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
