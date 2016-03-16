import path from 'path'

export default {
	entry: './src/client/index.js',
	output: {
		path: path.join(process.cwd(), 'lib/static'),
		filename: 'index.js'
	},
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'babel' }
		]
	}
}
