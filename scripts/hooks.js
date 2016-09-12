import { chmodSync } from 'fs'
import { join } from 'path'
import { dirname } from 'path'
import { statSync } from 'fs'
import { lstatSync } from 'fs'
import { readdirSync } from 'fs'
import { readlinkSync } from 'fs'
import { relative } from 'path'
import { resolve } from 'path'
import { symlinkSync } from 'fs'
import { unlinkSync } from 'fs'
import { X_OK } from 'fs'

const workingDirectoryPath = join(__dirname, '..')
const inputDirectoryPath = join(workingDirectoryPath, 'hooks/')
const outputDirectoryPath = join(workingDirectoryPath, '.git/hooks/')

const command = process.argv[2]
const force = process.argv.indexOf('--force') !== -1
switch (command) {
	case 'install':
		install()
		break
	case 'uninstall':
		uninstall()
		break
	default:
		throw new RangeError(`Unknown command "${command}".`)
}

function install() {
	return readdirSync(inputDirectoryPath)
	.filter(name => {
		const absoluteInputFilePath = resolve(inputDirectoryPath, name)
		const stat = statSync(absoluteInputFilePath)
		if (!stat.isFile()) return false
		if (/^\./.test(name)) return false // Skip files starting with a .
		if (!(stat.mode & X_OK)) {
			chmodSync(absoluteInputFilePath, stat.mode | X_OK)
		}
		return true
	})
	.map(name => {
		const absoluteInputFilePath = resolve(inputDirectoryPath, name)
		const absoluteOutputFilePath = resolve(outputDirectoryPath, name.replace(/\.[^.]+$/, ''))
		const relativeTargetPath = relative(dirname(absoluteOutputFilePath), absoluteInputFilePath)
		try {
			const outputStat = lstatSync(absoluteOutputFilePath)
			if (outputStat.isSymbolicLink()) {
				const actualTargetPath = readlinkSync(absoluteOutputFilePath)
				if (actualTargetPath === relativeTargetPath) {
					console.log(`Skipped creating link ${relative(workingDirectoryPath, absoluteOutputFilePath)} because it already exists and points to the expected file.`)
				} else {
					if (force) {
						unlinkSync(absoluteOutputFilePath)
						symlinkSync(relativeTargetPath, absoluteOutputFilePath)
						console.log(`Modified link ${relative(workingDirectoryPath, absoluteOutputFilePath)} so that it points to ${relativeTargetPath} instead of ${actualTargetPath}.`)
					} else {
						console.error(`Failed to create link ${relative(workingDirectoryPath, absoluteOutputFilePath)}: it already exists but points to ${actualTargetPath} instead of ${relativeTargetPath}.`)
						process.exitCode = 1
					}
				}
			} else {
				console.error(`Failed to create link ${relative(workingDirectoryPath, absoluteOutputFilePath)}: will not overwrite something other than a symbolic link.`)
				process.exitCode = 1
			}
		} catch (error) {
			if (!error || error.code !== 'ENOENT') throw error
			symlinkSync(relativeTargetPath, absoluteOutputFilePath)
			console.log(`Created link ${relative(workingDirectoryPath, absoluteOutputFilePath)} pointing to ${relative(workingDirectoryPath, absoluteInputFilePath)}.`)
		}
	})
}

function uninstall() {
	return readdirSync(inputDirectoryPath)
	.filter(name => {
		const absoluteInputFilePath = resolve(inputDirectoryPath, name)
		const stat = statSync(absoluteInputFilePath)
		return stat.isFile() && !/^\./.test(name)
	})
	.map(name => {
		const absoluteInputFilePath = resolve(inputDirectoryPath, name)
		const absoluteOutputFilePath = resolve(outputDirectoryPath, name.replace(/\.[^.]+$/, ''))
		const relativeTargetPath = relative(dirname(absoluteOutputFilePath), absoluteInputFilePath)
		try {
			const outputStat = lstatSync(absoluteOutputFilePath)
			if (outputStat.isSymbolicLink()) {
				const actualTargetPath = readlinkSync(absoluteOutputFilePath)
				if (actualTargetPath === relativeTargetPath) {
					unlinkSync(absoluteOutputFilePath)
					console.log(`Removed link ${relative(workingDirectoryPath, absoluteOutputFilePath)}.`)
				} else {
					if (force) {
						unlinkSync(absoluteOutputFilePath)
						console.log(`Removed link ${relative(workingDirectoryPath, absoluteOutputFilePath)}.`)
					} else {
						console.error(`Skipped removing link ${relative(workingDirectoryPath, absoluteOutputFilePath)}: it points to ${actualTargetPath} instead of ${relativeTargetPath}.`)
						process.exitCode = 1
					}
				}
			} else {
				console.error(`Failed to remove link ${relative(workingDirectoryPath, absoluteOutputFilePath)}: it is not a symbolic link.`)
				process.exitCode = 1
			}
		} catch (error) {
			if (!error || error.code !== 'ENOENT') throw error
			console.log(`Skipped removing link ${relative(workingDirectoryPath, absoluteOutputFilePath)}: it doesn't exist.`)
		}
	})
}
