import curry from 'funko/lib/curry'
import mkdir from 'funko-fs/lib/mkdir'
import rejected from 'funko/lib/future/rejected'
import resolved from 'funko/lib/future/resolved'
import stat from 'funko-fs/lib/stat'
import { dirname } from 'path'

const mkdirp = curry(2, (mode, path) =>
	mkdir(mode, path)
	.chainLeft(error => {
		if (error && error.code === 'EEXIST') {
			return stat(path)
			.chain(stat => {
				if (stat.isDirectory()) return resolved(path)
				if (stat.isFile()) return rejected(new Error(`Unable to create directory because "${path}" points to a file.`))
				return rejected(new Error(`Unable to create directory because "${path}" is not a file nor a directory.`))
			})
		}
		if (error && error.code === 'ENOENT') {
			return mkdirp(mode, dirname(path))
			.chain(() => mkdirp(mode, path))
		}
		return rejected(error)
	})
)

export default mkdirp
