import { logEvents } from '../middleware/logEvents.js'
import { readUserDataFile } from '../database/readDatafile.js'
import { writeUserDataFile } from '../database/writeDatafile.js'
import bcrypt from 'bcryptjs'

const handleNewUser = async (req, res) => {
	const { user, pwd } = req.body
	const users = await readUserDataFile()

	if (!user || !pwd)
		return res
			.status(400)
			.json({ success: false, message: 'Username and password are required' })

	const duplicate = users.find(person => person.user === user)

	if (duplicate)
		return res.status(409).json({ success: false, message: 'Username already exists' })

	try {
		const hashed = await bcrypt.hash(pwd, 10)

		const newUser = {
			"id": users.length ? users[users.length - 1].id + 1 : 1,
			"user": user,
      "roles": {"User": 2001 },
			"pwd": hashed,
		}

		const updated = [...users, newUser]

		await writeUserDataFile(updated)
		res.status(201).json({
			success: true,
			message: `New user ${user} created ...`,
			user: newUser,
		})

		await logEvents(`New User created: ${user}`, 'userLog.txt')
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
		await logEvents(`Error creating new User: ${err.message}`, 'userLog.txt')
		await logEvents(`Error creating new User: ${err.message}`, 'errLog.txt')
	}
}

export { handleNewUser }