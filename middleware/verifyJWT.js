import jwt from 'jsonwebtoken'

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  const token = authHeader?.split(' ')[1]

  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401)

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        logEvents(`Access denied: ${user}`, 'userLog.txt')

        return res.sendStatus(403).json({ success: false, message: `Access denied: ${user}` })
      }

      req.user = decoded.UserInfo.user
      req.roles = decoded.UserInfo.roles
      logEvents(`Access granted: ${user}`, 'userLog.txt')
      res.sendStatus(200).json({ success: true, message: `Access granted: ${user}` })
      next()
    }
  )
}

export { verifyJWT }

