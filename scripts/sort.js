import createFileTransformerSync from './utility/createFileTransformerSync'
import createJsonTransformer from './utility/createJsonTransformer'
import glob from 'glob'
import sortObject from 'sort-object-circular'
import sortLines from './utility/sortLines'
import { join } from 'path'

const workingDirectoryPath = join(__dirname, '..')

const jsonResults = glob.sync('**/{.babelrc,*.json}', {
	cwd: workingDirectoryPath,
	dot: true,
	ignore: [
		'**/node_modules/**',
		'release/**'
	]
}).map(filePath => {
	return createFileTransformerSync(
		createJsonTransformer(sortObject)
	)({
		workingDirectoryPath,
		inputFilePath: filePath,
		outputFilePath: filePath
	})
})

const linesResults = glob.sync('**/{.eslintignore,.gitignore,.npmignore}', {
	cwd: workingDirectoryPath,
	ignore: [
		'**/node_modules/**',
		'release/**'
	]
}).map(filePath => {
	return createFileTransformerSync(
		buffer => sortLines(buffer.toString())
	)({
		workingDirectoryPath,
		inputFilePath: filePath,
		outputFilePath: filePath
	})
})

export default [ ...jsonResults, ...linesResults ]
