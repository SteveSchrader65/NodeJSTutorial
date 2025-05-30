import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { promises as fsPromises } from 'fs'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logsDir = path.join(__dirname, '..', 'logs')

const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
  const logItem = `${dateTime}\t${uuid()}\tLogging: ${message}\n`

  try {
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir)
    }

    await fsPromises.appendFile(path.join(logsDir, logName), logItem)
  } catch (err) {
    try {
      if (!fs.existsSync(logsDir)) {
        await fsPromises.mkdir(logsDir)
      }

      await fsPromises.appendFile(path.join(logsDir, 'errLog.txt'), logItem)
    } catch (internalErr) {}
  }
}

const logger = async (req, res, next) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
  const message = `${req.method}\t${req.headers.origin}\t${req.url}`
  const logItem = `${dateTime}\t${uuid()}\tMiddleware: ${message}\n`

  try {
    await logEvents(message, 'reqLog.txt')
  } catch (err) {
    try {
      if (!fs.existsSync(logsDir)) {
        await fsPromises.mkdir(logsDir)
      }

      await fsPromises.appendFile(path.join(logsDir, 'errLog.txt'), logItem)
    } catch {}
  } finally {
    next()
  }
}

export { logEvents, logger }