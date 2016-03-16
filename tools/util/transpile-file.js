import all from 'funko/lib/future/all'
import curry from 'funko/lib/curry'
import mkdirp from './mkdirp'
import path from 'path'
import readFile from 'funko-fs/lib/read-file'
import rejected from 'funko/lib/future/rejected'
import writeFile from 'funko-fs/lib/write-file'
import { transform } from 'babel-core'

const transpileFile = curry(3, (sourceFolder, destinationFolder, filePath) =>
	all([
		readFile(null, path.join(sourceFolder, filePath)),
		mkdirp(null, path.dirname(path.join(destinationFolder, filePath)))
	])
	// Future Error [ Buffer, String ]
	.chain(([ buffer ]) => {
		const options = {
			sourceRoot: destinationFolder,
			sourceMaps: true,
			filename: filePath
		}
		let transpiled = null
		try {
			transpiled = transform(buffer, options)
		} catch (error) {
			return rejected(error)
		}
		const futures = []
		if (transpiled.map && options.sourceMaps !== 'inline') {
			const mapFilePath = filePath + '.map'
			transpiled.code = transpiled.code + `\n//# sourceMappingURL=${path.basename(mapFilePath)}`
			futures.push(writeFile(null, path.join(destinationFolder, mapFilePath), JSON.stringify(transpiled.map)).map(() => mapFilePath))
		}
		futures.push(writeFile(null, path.join(destinationFolder, filePath), transpiled.code).map(() => filePath))
		return all(futures)
	})
	// Future Error [ String ]
)

export default transpileFile
