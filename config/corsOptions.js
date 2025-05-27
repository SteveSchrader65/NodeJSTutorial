const whiteList = [
  'https://www.google.com',
  'http://127.0.0.1:5500',
  'http://localhost:3500'
]

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('CORS: Not permitted'))
    }
  },

  optionsSuccessStatus: 200
}

export { corsOptions }