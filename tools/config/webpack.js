import BUILD_PATH from './BUILD_PATH'
import path from 'path'

export default {
	entry: [
		'./src/client/index.js',
		'./tools/util/reload-client.js'
	],
	output: {
		path: path.join(BUILD_PATH, 'static'),
		filename: 'index.js'
	},
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'babel' }
		]
	}
}
