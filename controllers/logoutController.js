import path from 'path'
import { promises as fsPromises } from 'fs'

const __dirname = import.meta.dirname

async function readUserDataFile() {
	try {
		const userData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			'utf8'
		)

		return JSON.parse(userData)
	} catch (err) {
		// Convert console message to userLog.txt entry
		console.error(`Error reading user data: ${err.message}`)
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

// NOTE: Delete access token on client-side
const handleLogout = async (req, res) => {
	const cookies = req.cookies

	if (!cookies?.jwt) return res.sendStatus(204) //No content

	const refreshToken = cookies.jwt
	const users = await readUserDataFile()
	const userMatch = users.find(person => person.refreshToken === refreshToken)

	if (!userMatch) {
		res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

		return res.sendStatus(204)
		// return res.status(204).json({ success: true, message: `${userMatch.user} has logged-out` })
	}

	// Delete refreshToken in db
	const otherUsers = users.filter(person => person.refreshToken != userMatch.refreshToken)
	const currentUser = { ...userMatch, refreshToken: '' }

	await fsPromises.writeFile(
		path.join(__dirname, '..', 'model', 'users.json'),
		JSON.stringify([...otherUsers, currentUser], null, 2)
	)

	res.clearCookie('jwt', { httpOnly: true /*, secure: true*/ })
	res.sendStatus(204)
	// res.status(204).json({ success: true, message: `${userMatch.user} has logged-out` })
}

export { handleLogout }
