/* eslint-env mocha, node */
import { readdirSync } from 'fs'
import { statSync } from 'fs'
import { writeFileSync } from 'fs'

const lines = readdirSync('.')
.map(filename => ({
	filename,
	stat: statSync(filename)
}))
.filter(({ filename, stat }) =>
	stat.isFile()
	&& /\.js$/.test(filename)
	&& !/\.test\.js$/.test(filename)
	&& filename !== 'index.js'
)
.map(({ filename }) => {
	const name = filename.replace(/\.js$/, '')
	return `export { default as ${name} } from './${name}'`
})
.sort()

writeFileSync('index.js', [
	'// This file has been generated.',
	...lines,
	''
].join('\n'))
