import guardedSpawnSync from '../scripts/utility/guardedSpawnSync'
import { version } from '../package.json'
import { join } from 'path'

guardedSpawnSync('documentation', [ 'build',
	'--output', join('documentation', version),
	'--format', 'html'
], {
	stdio: 'inherit'
})

guardedSpawnSync('git', [ 'add', version ], {
	cwd: join(process.cwd(), 'documentation'),
	stdio: 'inherit'
})

guardedSpawnSync('git', [ 'commit', '--no-verify', '-m', `Documentation for version ${version}`], {
	cwd: join(process.cwd(), 'documentation'),
	stdio: 'inherit'
})

guardedSpawnSync('git', [ 'add', 'documentation' ], {
	stdio: 'inherit'
})
