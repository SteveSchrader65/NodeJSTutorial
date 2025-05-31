import path from 'path'
import { promises as fsPromises } from 'fs'
import { logEvents } from '../middleware/logEvents.js'

const __dirname = import.meta.dirname

async function readUserDataFile() {
	try {
		const userData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			'utf8'
		)

		return JSON.parse(userData)
	} catch (err) {
		throw new Error(`Error reading user data: ${err.message}`)
	}
}

async function writeUserDataFile(data) {
	try {
		await fsPromises.writeFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			JSON.stringify(data, null, 2)
		)
	} catch (err) {
		throw new Error(`Error writing user data: ${err.message}`)
	}
}

// NOTE: Delete access token on client-side
const handleLogout = async (req, res, next) => {
	const cookies = req.cookies
  const clientIP = req.ip || req.connection.remoteAddress

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')

	if (!cookies?.jwt) {
    const failMessage = `Attempted to logout without JWT cookie - IP: ${clientIP}`

    await logEvents(failMessage, 'reqLog.txt')
    return res.status(400).json({success: false, message: failMessage})
  }

  try {
		const refreshToken = cookies.jwt
		const users = await readUserDataFile()
		const userMatch = users.find(person => person.refreshToken === refreshToken)
    const isProduction = process.env.NODE_ENV === 'production'

		res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: isProduction })

		if (!userMatch) {
			const failMessage = `Logout attempt with invalid refresh token - IP: ${clientIP}`

			await logEvents(failMessage, 'reqLog.txt')
			return res.status(400).json({ success: false, message: failMessage })
		}

		// Delete refreshToken in db
		const otherUsers = users.filter(person => person.refreshToken !== userMatch.refreshToken)
		const currentUser = { ...userMatch, refreshToken: '' }
		const successMessage = `User '${userMatch.user}' logged out successfully - IP: ${clientIP}`

		await writeUserDataFile([...otherUsers, currentUser])
		await logEvents(successMessage, 'userLog.txt')

		res.status(200).json({success: true, message: successMessage})
  } catch (err) {
    next (err)
  }
}

export { handleLogout }
