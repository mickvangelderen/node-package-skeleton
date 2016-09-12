/* eslint-env node */

import { relative } from 'path'

function relativePath(path) {
	return relative(process.cwd(), path)
}

export default relativePath
