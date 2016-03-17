import BUILD_PATH from './BUILD_PATH'
import path from 'path'
import cssnext from 'postcss-cssnext'
import precss from 'precss'
import ExtractTextWebpackPlugin from 'extract-text-webpack-plugin'

const extractCss = new ExtractTextWebpackPlugin('index.css')

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
			{ test: /\.js$/, loader: 'babel' },
			{ test: /\.css$/, loader: extractCss.extract('style', 'css-loader?modules&importLoaders=1&localIdentName=[path][name]--[local]--[hash:base64:5]!postcss-loader') }
		]
	},
	plugins: [
		extractCss
	],
	postcss: function() {
		return [ cssnext(), precss() ]
	}
}
