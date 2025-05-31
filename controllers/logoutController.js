import path from 'path'
import { promises as fsPromises } from 'fs'
import { logEvents } from '../middleware/logEvents.js'
import { errorHandler } from '../middleware/errorHandler.js'

const __dirname = import.meta.dirname

async function readUserDataFile() {
	try {
		const userData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			'utf8'
		)

		return JSON.parse(userData)
	} catch (err) {
    await logEvents(`Error reading user data: ${err.message}`)
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
    throw err
	}
}

// NOTE: Delete access token on client-side
const handleLogout = async (req, res) => {
	const cookies = req.cookies
  const clientIP = req.ip || req.connection.remoteAddress

	if (!cookies?.jwt) {
    const message = `Attempted to logout without JWT cookie - IP: ${clientIP}`

    await logEvents(`${message}`, 'reqLog.txt')
    return res.status(204).json({success: false, message: message})
  }

  try {
		const refreshToken = cookies.jwt
		const users = await readUserDataFile()
		const userMatch = users.find(person => person.refreshToken === refreshToken)

		res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

		if (!userMatch) {
			const message = `Logout attempt with invalid refresh token - IP: ${clientIP}`

			await logEvents(message, 'reqLog.txt')
			return res.status(204).json({ success: false, message: message })
		}

		// Delete refreshToken in db
		const otherUsers = users.filter(person => person.refreshToken != userMatch.refreshToken)
		const currentUser = { ...userMatch, refreshToken: '' }
		const successMessage = `User '${userMatch.user}' logged out successfully - IP: ${clientIP}`

		await writeUserDataFile([...otherUsers, currentUser])
		await logEvents(`${successMessage}`, 'userLog.txt')

		res.status(204).json({success: true, message: successMessage})
  } catch (err) {
		const errorMessage = `Logout error: ${err.message} - IP: ${clientIP}`

    await logEvents(`${errorMessage}`, 'errLog.txt')
		return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}`})
  }
}

export { handleLogout }
