/* eslint-disable no-console */
import all from 'funko/lib/future/all'
import BUILD_PATH from './config/BUILD_PATH'
import copyFile from './util/copy-file'
import glob from './util/glob'
import log from './util/log'
import map from 'funko/lib/map'
import path from 'path'
import pipe from 'funko/lib/pipe'
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

const performBabel = glob({
	cwd: SOURCE_PATH,
	ignore: [ '*.test.js', 'client/**/*' ]
}, '**/*.js')
// Future Error [ String ]
.chain(pipe([
	// [ String ]
	map(file =>
		transpileFile(SOURCE_PATH, BUILD_PATH, file)
		.map(tap(() => log.info(`Transpiled ${file}.`)))
	),
	// [ Future Error Buffer ]
	all
	// Future Error [ String ]
]))

const performCopy = glob({
	cwd: SOURCE_PATH
}, 'static/**/*')
// Future Error [ String ]
.chain(pipe([
	// [ String ]
	map(file =>
		copyFile(SOURCE_PATH, BUILD_PATH, file)
		.map(tap(() => log.info(`Copied ${file}.`)))
	),
	// [ Future Error Buffer ]
	all
	// Future Error [ String ]
]))

all([
	performBabel.map(tap(() => log.info(`Transpiled javascript from ${path.relative(process.cwd(), SOURCE_PATH)}/ to ${path.relative(process.cwd(), BUILD_PATH)}/.`))),
	performCopy.map(tap(() => log.info(`Copied static files from ${path.relative(process.cwd(), SOURCE_PATH)}/ to ${path.relative(process.cwd(), BUILD_PATH)}/.`)))
])
.fork(pipe([ errorToStack, log.error ]), () => {})

webpack(webpackConfig, function(error, stats) {
	if (error) return log.error(error)
	log.info('Packed assets\n' + stats.toString(webpackStats))
})
