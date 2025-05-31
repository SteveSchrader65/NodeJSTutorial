import { logEvents } from './logEvents.js'

const errorHandler = (err, req, res, next) => {
  const clientIP = req?.ip || req?.connection?.remoteAddress || 'unknown'
  const method = req?.method || 'unknown'
  const url = req?.url || 'unknown'
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message

  logEvents(`${err.name}: ${err.message} - ${method} ${url} - IP: ${clientIP}`, 'errLog.txt')
  res.status(500).send(message)
}

export { errorHandler }