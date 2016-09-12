import { resolve } from 'path'
import { dirname } from 'path'
import { readFileSync } from 'fs'
import { statSync } from 'fs'
import { writeFileSync } from 'fs'
import { mkdirSync } from 'fs'

function createFileTransformerSync(transformation) {
	return function transformFileSync({
		workingDirectoryPath = process.cwd(),
		inputFilePath,
		outputFilePath
	}) {
		const absoluteInputFilePath = resolve(workingDirectoryPath, inputFilePath)
		const absoluteOutputFilePath = resolve(workingDirectoryPath, outputFilePath)
		ensureDirectory(dirname(absoluteOutputFilePath))
		const input = readFileSync(absoluteInputFilePath)
		const output = transformation(input)
		const absoluteOutputFilePaths = []
		if (absoluteInputFilePath !== absoluteOutputFilePath || input.toString() !== output.toString()) {
			writeFileSync(absoluteOutputFilePath, output)
			absoluteOutputFilePaths.push(absoluteOutputFilePath)
		}
		return {
			absoluteInputFilePath,
			absoluteOutputFilePaths
		}
	}
}

function ensureDirectory(path) {
	try {
		const stat = statSync(path)
		if (stat.isDirectory()) return
	} catch (error) {
		if (error.code === 'ENOENT') {
			const next = dirname(path)
			if (path === next) throw new Error(`Unable to create path "${path}".`)
			ensureDirectory(next)
			mkdirSync(path)
		} else {
			throw error
		}
	}
}

export default createFileTransformerSync
