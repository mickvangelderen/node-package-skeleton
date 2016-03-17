import server from './'
import PORT from './config/PORT'

console.log('Starting server...') // eslint-disable-line no-console

const instance = server.listen(PORT, () => {
	console.log('Server started', instance.address()) // eslint-disable-line no-console
})

export default instance
