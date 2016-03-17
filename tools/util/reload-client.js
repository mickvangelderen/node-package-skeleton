/* eslint-env browser */
import io from 'socket.io-client'
import RELOAD_SERVER_PORT from '../config/RELOAD_SERVER_PORT'

var socket = io(`http://localhost:${RELOAD_SERVER_PORT}`)

socket.on('change', () => {
	document.location.reload(true)
})
