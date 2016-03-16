import all from 'funko/lib/future/all'
import curry from 'funko/lib/curry'
import mkdirp from './mkdirp'
import path from 'path'
import readFile from 'funko-fs/lib/read-file'
import writeFile from 'funko-fs/lib/write-file'

const copyFile = curry(3, (sourceFolder, destinationFolder, filePath) =>
	all([
		readFile(null, path.join(sourceFolder, filePath)),
		mkdirp(null, path.dirname(path.join(destinationFolder, filePath)))
	])
	.chain(([ buffer ]) => writeFile(null, path.join(destinationFolder, filePath), buffer))
	.map(() => filePath)
)

export default copyFile
