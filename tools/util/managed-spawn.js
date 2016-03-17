/* eslint-disable no-console */
import { spawn } from 'child_process'

const STOPPED = { state: 'STOPPED' }
const STARTED = { state: 'STARTED' }
const STOPPING = { state: 'STOPPING' }

function ManagedSpawn(command, args, options) {

	let state = STOPPED
	let child = null
	let shouldRestart = false

	const onStop = () => {
		state = STOPPED
		if (shouldRestart) {
			shouldRestart = false
			start()
		}
	}

	const start = () => {
		if (state !== STOPPED) return
		child = spawn(command, args, options)
		child.on('error', onStop)
		child.on('close', onStop)
		state = STARTED
	}

	const stop = () => {
		if (state !== STARTED) return
		child.kill()
		child = null
		state = STOPPING
	}

	const restart = () => {
		switch(state) {
			case STOPPED:
				start()
				break
			case STARTED: 
				shouldRestart = true
				stop()
				break
			case STOPPING:
				// Do nothing.
		}
	}

	return {
		start,
		restart,
		stop
	}
}

export default ManagedSpawn
