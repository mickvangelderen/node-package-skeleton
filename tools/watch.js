/* eslint-disable no-console */
import BUILD_PATH from './config/BUILD_PATH'
import chokidar from 'chokidar'
import copyFile from './util/copy-file'
import log from './util/log'
import ManagedSpawn from './util/managed-spawn'
import pipe from 'funko/lib/pipe'
import RELOAD_SERVER_PORT from './config/RELOAD_SERVER_PORT'
import reloadServer from './util/reload-server'
import SOURCE_PATH from './config/SOURCE_PATH'
import tap from 'funko/lib/tap'
import transpileFile from './util/transpile-file'
import webpack from 'webpack'
import webpackConfig from './config/webpack'
import webpackStats from './config/webpack-stats'

const errorToStack = err => {
	if (err._babel && err.codeFrame) {
		return `${err.name}: ${err.message}\n${err.codeFrame}`
	} else {
		return err.stack
	}
}

const server = ManagedSpawn('node', ['lib/server/instance.js'], { stdio: 'inherit' })

reloadServer.listen(RELOAD_SERVER_PORT)

const restartClient = tap(() => reloadServer.emit('change'))
const restartServer = tap(server.restart)

const watchBabel = chokidar.watch('**/*.js', {
	cwd: SOURCE_PATH,
	ignore: [ '*.test.js', 'client/**/*' ]
})

const transpile = file => {
	transpileFile(SOURCE_PATH, BUILD_PATH, file)
	.fork(
		pipe([ errorToStack, log.error ]),
		pipe([ restartServer, file => log.info(`Transpiled ${file}.`) ])
	)
}

watchBabel.on('add', transpile)
watchBabel.on('change', transpile)

const watchCopy = chokidar.watch('static/**/*', {
	cwd: SOURCE_PATH
})

const copy = file => {
	copyFile(SOURCE_PATH, BUILD_PATH, file)
	.fork(
		log.error, 
		pipe([ restartClient, file => log.info(`Copied ${file}.`) ])
	)
}

watchCopy.on('add', copy)
watchCopy.on('change', copy)

var watchWebpack = webpack(webpackConfig)

watchWebpack.watch({}, (error, stats) => {
	if (error) return log.error(error)
	if (!stats.hasErrors) restartClient()
	log.info(stats.toString(webpackStats))
})
