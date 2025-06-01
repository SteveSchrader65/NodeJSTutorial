import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { readUserDataFile } from '../database/readDatafile.js'

const handleRefresh = async (req, res) => {
	const cookies = req.cookies

  if (!cookies?.jwt) return res.sendStatus(401)

  const refreshToken = cookies.jwt
  const users = await readUserDataFile()

	const userMatch = users.find(person => person.refreshToken === refreshToken)

  if (!userMatch) return res.sendStatus(403)

  dotenv.config()

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || userMatch.user !== decoded.user) return res.sendStatus(403)

    const roles = Object.values(userMatch.roles)
    const accessToken = jwt.sign(
      {
        'UserInfo': {
          'user': decoded.user,
          'roles': roles
        },
      },
        process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    )

    res.json({ accessToken })
	})
}

export { handleRefresh }
