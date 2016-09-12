import createFileTransformerSync from './utility/createFileTransformerSync'
import createJsonTransformer from './utility/createJsonTransformer'
import guardedSpawnSync from '../scripts/utility/guardedSpawnSync'
import { join } from 'path'
import { relative } from 'path'
import { resolve } from 'path'

const workingDirectoryPath = join(__dirname, '..')
const inputDirectoryPath = workingDirectoryPath
const outputDirectoryPath = join(workingDirectoryPath, 'release')
const copyFileSync = createFileTransformerSync(input => input)

build({
	inputDirectoryPath,
	outputDirectoryPath,
	preset: 'es2015-node4',
	engines: {
		node: '>=4.0.0'
	}
})

function build({
	inputDirectoryPath,
	outputDirectoryPath,
	preset,
	engines
}) {
	// Build source files.
	guardedSpawnSync('babel', [
		'*.js',
		'--out-dir', relative(workingDirectoryPath, resolve(workingDirectoryPath, outputDirectoryPath)),
		'--source-maps',
		'--presets', preset,
		'--ignore', 'node_modules/',
		'--ignore', 'examples/',
		'--ignore', 'release/',
		'--ignore', 'hooks/',
		'--ignore', 'scripts/'
	], {
		cwd: workingDirectoryPath,
		stdio: 'inherit'
	})

	// Build package.json.
	createFileTransformerSync(
		createJsonTransformer(
			createPackageTransformer({ engines }),
			{ sort: true }
		)
	)({
		workingDirectoryPath,
		inputFilePath: join(inputDirectoryPath, 'package.json'),
		outputFilePath: join(outputDirectoryPath, 'package.json')
	})

	// Build mocha.opts
	createFileTransformerSync(
		input => input.toString().replace('--compilers js:babel-register', '')
	)({
		workingDirectoryPath,
		inputFilePath: join(inputDirectoryPath, 'test/mocha.opts'),
		outputFilePath: join(outputDirectoryPath, 'test/mocha.opts')
	})

	// Build readme.md and .npmignore.
	;[ 'readme.md', '.npmignore' ].forEach(relativeFilePath =>
		copyFileSync({
			workingDirectoryPath,
			inputFilePath: join(inputDirectoryPath, relativeFilePath),
			outputFilePath: join(outputDirectoryPath, relativeFilePath)
		})
	)
}

function createPackageTransformer({ engines }) {
	return function transformPackage(pkg) {
		return Object.keys(pkg)
		.filter(key => !/^(private)$/.test(key))
		.reduce((map, key) => {
			map[key] = key === 'devDependencies'
				? transformDevDependencies(pkg[key])
				: key === 'scripts'
				? transformScripts(pkg[key])
				: pkg[key]
			return map
		}, {
			engines
		})
	}
}

function transformDevDependencies(devDependencies) {
	return Object.keys(devDependencies)
	.filter(key => /^(mocha|must)$/.test(key))
	.reduce((map, key) => {
		map[key] = devDependencies[key]
		return map
	}, {})
}

function transformScripts(scripts) {
		return Object.keys(scripts)
		.filter(key => /^(test|prepublish)$/.test(key))
		.reduce((map, key) => {
			map[key] = scripts[key]
			return map
		}, {})
}
