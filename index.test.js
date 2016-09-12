/* eslint-env mocha, node */

import * as index from './'
import expect from 'must'
import { join } from 'path'
import { readdirSync } from 'fs'
import { statSync } from 'fs'

describe('index', () => {

	it('should export public functionality', () => {
		const files = readdirSync(__dirname).map(filename => ({
			filename,
			stat: statSync(join(__dirname, filename))
		}))

		files
		.filter(({ filename, stat }) =>
			stat.isFile()
			&& /\.js$/.test(filename)
			&& /\.test\.js$/.test(filename) === false
			&& filename !== 'index.js'
		)
		.forEach(({ filename }) => {
			const name = filename.replace(/\.js$/, '')
			expect(index).to.have.ownProperty(name, require(join(__dirname, filename)).default)
		})
	})

})
