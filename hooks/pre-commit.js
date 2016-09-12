#!node_modules/.bin/babel-node

import results from '../scripts/sort'
import guardedSpawnSync from '../scripts/utility/guardedSpawnSync'

const changes = results
.map(result => result.absoluteOutputFilePaths.length)
.reduce((a, b) => a + b, 0)

if (changes) {
	console.error('Some files were automatically sorted, please review your commit.')
	process.exit(1)
}

guardedSpawnSync('npm', [ 'run', 'lint' ], { stdio: 'inherit' })

guardedSpawnSync('npm', [ 'run', 'flow' ], { stdio: 'inherit' })
