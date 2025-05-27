import { logEvents } from './logEvents.js'

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}\n`, 'errLog.txt')
  res.status(500).send(err.message)
}

export { errorHandler }