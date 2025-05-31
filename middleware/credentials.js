import { whiteList } from '../config/whiteList.js'

const credentials = (req, res, next) => {
	const origin = req.headers.origin

	if (whiteList.includes(origin)) {
		res.header('Access-Control-Allow-Credentials', true)
	}
	next()
}

export { credentials }
