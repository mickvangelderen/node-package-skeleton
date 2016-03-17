/* eslint-disable no-console */
import all from 'funko/lib/future/all'
import BUILD_PATH from './config/BUILD_PATH'
import copyFile from './util/copy-file'
import glob from './util/glob'
import map from 'funko/lib/map'
import pipe from 'funko/lib/pipe'
import SOURCE_PATH from './config/SOURCE_PATH'
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

const performBabel = glob({
	cwd: SOURCE_PATH,
	ignore: [ '*.test.js', 'client/**/*' ]
}, '**/*.js')
// Future Error [ String ]
.chain(pipe([
	// [ String ]
	map(file => transpileFile(SOURCE_PATH, BUILD_PATH, file)),
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
	map(file => copyFile(SOURCE_PATH, BUILD_PATH, file)),
	// [ Future Error Buffer ]
	all
	// Future Error [ String ]
]))

all([
	performBabel.map(() => 'Transpiled javascript.'),
	performCopy.map(() => 'Copied static files.')
])
.fork(pipe([ errorToStack, console.error ]), console.log)

webpack(webpackConfig, function(error, stats) {
	if (error) return console.error(error)
	console.log(stats.toString({ colors: true }))
})