import { logEvents } from './logEvents.js'

const errorHandler = (err, req, res, msgOrNext) => {
	const clientIP = req?.ip || req?.connection?.remoteAddress || 'unknown'
	const method = req?.method || 'unknown'
	const url = req?.url || 'unknown'

	let msg
	if (typeof msgOrNext === 'function') {
		msg = err.message || 'Internal Server Error'
	} else {
		msg = msgOrNext || err.message || 'Internal Server Error'
	}

	logEvents(`${err.name}: ${method} ${url} - IP: ${clientIP}: ${msg}`, 'errLog.txt')
	res.status(500).send(msg)
}

export { errorHandler }