import { spawnSync } from 'child_process'

function guardedSpawnSync(app, args, opts) { // eslint-disable-line no-unused-vars
	const spawn = spawnSync.apply(this, arguments)
	if (spawn.error) throw spawn.error
	if (spawn.status !== 0) process.exit(spawn.status)
	return spawn
}

export default guardedSpawnSync
