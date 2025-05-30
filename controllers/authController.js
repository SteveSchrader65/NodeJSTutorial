import path from 'path'
import fs, {promises as fsPromises} from 'fs'
import {getDirname} from '../config/dirname.js'
import {logEvents} from '../middleware/logEvents.js'
import {errorHandler} from '../middleware/errorHandler.js'
import bcrypt from 'bcryptjs'

// ES modules equivalent of __dirname
const __dirname = getDirname(import.meta.url)

async function readUserDataFile() {
  try {
    const userData = await fsPromises.readFile(path.join(__dirname, '..', 'model', 'users.json'), 'utf8')
    const users = JSON.parse(userData)

    return users
  } catch (err) {
    errorHandler(`Error reading user data: ${err.message}`)
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

const handleLogin = async (req, res) => {
  const users = await readUserDataFile()
  const {user, pwd} = req.body

  if (!user || !pwd) return res.status(400).json({success: false, message: 'Username and password are required'})

  const userMatch = users.find(person => person.user === user)

  if (!userMatch) return res.sendStatus(401)

  try {
		const hashMatch = await bcrypt.compare(pwd, userMatch.pwd)

		if (hashMatch) {
			// Create JWT here
			res.json({ success: true, message: `User ${user} has logged-in` })
			await logEvents(`User ${user} has logged-in`, 'userLog.txt')
		} else {
			res.sendStatus(401)
			await logEvents(`User ${user} failed to log-in - incorrect password`, 'userLog.txt')
		}
  } catch (err) {
		res.sendStatus(401)
		await logEvents(`User ${user} failed to log-in`, 'userLog.txt')
  }
}

export {handleLogin}
