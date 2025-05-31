import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!authHeader) {
    // Add user log entry to show authorization failed
    return res.sendStatus(401)
  }

  dotenv.config()

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
	  	// Add user log entry to show access denied
      if (err) return res.sendStatus(403)

		  // Add user log entry to show access granted
      req.user = decoded.user
      next()
    }
  )
}

export { verifyJWT }