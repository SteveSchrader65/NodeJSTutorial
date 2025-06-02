import { readUserDataFile } from '../database/readDatafile.js'
import { writeUserDataFile } from '../database/writeDatafile.js'
import { logEvents } from '../middleware/logEvents.js'

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
    const isProduction = process.env.NODE_ENV === 'production' || true

		res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: isProduction })

		if (!userMatch) {
			const failMessage = `Logout attempt with invalid refresh token - IP: ${clientIP}`

			await logEvents(failMessage, 'reqLog.txt')
			return res.status(400).json({ success: false, message: failMessage })
		}

		// Delete refreshToken in db
		const otherUsers = users.filter(person => person.refreshToken !== userMatch.refreshToken)
		const currentUser = { ...userMatch, refreshToken: '' }
		const successMessage = `User ${userMatch.user} logged out successfully`

		await writeUserDataFile([...otherUsers, currentUser])
		await logEvents(successMessage, 'userLog.txt')

		res.status(200).json({success: true, message: successMessage})
  } catch (err) {
    next (err)
  }
}

export { handleLogout }
