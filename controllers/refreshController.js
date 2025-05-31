import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { promises as fsPromises } from 'fs'

const __dirname = import.meta.dirname

dotenv.config()

async function readUserDataFile() {
	try {
		const userData = await fsPromises.readFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			'utf8'
		)

		return JSON.parse(userData)
	} catch (err) {
		console.error(`Error reading user data: ${err.message}`)
		return []
	}
}

const handleRefresh = async (req, res) => {
	const cookies = req.cookies

  if (!cookies?.jwt) return res.sendStatus(401)

  const refreshToken = cookies.jwt
  const users = await readUserDataFile()

	const foundUser = users.find(person => person.refreshToken === refreshToken)

  if (!foundUser) return res.sendStatus(403) // Forbidden code

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.user !== decoded.user) return res.sendStatus(403)

    const accessToken = jwt.sign(
      { user: decoded.user },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    )

    res.json({ accessToken })
	})
}

export { handleRefresh }
