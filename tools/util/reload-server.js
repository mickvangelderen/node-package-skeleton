/* eslint-disable no-console */
import SocketServer from 'socket.io'

const io = SocketServer()

io.on('connection', function(socket) {
	console.log('connect', socket.id)

	socket.on('event', function(data) {
		console.log('event', data)
	})

	socket.on('disconnect', function() {
		console.log('disconnect', socket.id)
	})
})

export default io
