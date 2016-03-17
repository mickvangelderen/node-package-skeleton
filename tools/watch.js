/* eslint-disable no-console */
import BUILD_PATH from './config/BUILD_PATH'
import chokidar from 'chokidar'
import copyFile from './util/copy-file'
import ManagedSpawn from './util/managed-spawn'
import pipe from 'funko/lib/pipe'
import RELOAD_SERVER_PORT from './config/RELOAD_SERVER_PORT'
import reloadServer from './util/reload-server'
import SOURCE_PATH from './config/SOURCE_PATH'
import tap from 'funko/lib/tap'
import transpileFile from './util/transpile-file'
import webpack from 'webpack'
import webpackConfig from './config/webpack'

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
	ignore: '*.test.js'
})

const transpile = file => {
	transpileFile(SOURCE_PATH, BUILD_PATH, file)
	.fork(
		pipe([ errorToStack, console.error ]),
		pipe([ restartServer, console.log ])
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
		console.error, 
		pipe([ restartClient, console.log ])
	)
}

watchCopy.on('add', copy)
watchCopy.on('change', copy)

var watchWebpack = webpack(webpackConfig)

watchWebpack.watch({}, (error, stats) => {
	if (error) return console.error(error)
	restartClient()
	console.log(stats.toString({ colors: true }))
})
