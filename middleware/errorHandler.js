import { logEvents } from './logEvents.js'

const errorHandler = (err, req, res, msg) => {
	const clientIP = req?.ip || req?.connection?.remoteAddress || 'unknown'
	const method = req?.method || 'unknown'
	const url = req?.url || 'unknown'

	logEvents(`${err.name}: ${method} ${url} - IP: ${clientIP}: ${msg}`, 'errLog.txt')
	res.status(500).send(msg)
}

export { errorHandler }