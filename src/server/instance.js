import server from './'
import PORT from './config/PORT'

const instance = server.listen(PORT, () => {
	console.log(instance.address()) // eslint-disable-line no-console
})

export default instance
