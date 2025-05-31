import { whiteList } from './whiteList.js'

const corsOptions = {
	origin: (origin, callback) => {
		if (whiteList.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			callback(new Error('CORS: Not permitted'))
		}
	},

	optionsSuccessStatus: 200,
}

export { corsOptions }
