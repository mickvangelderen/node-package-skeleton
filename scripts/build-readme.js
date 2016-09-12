import remark from 'remark'
import { version } from '../package.json'
import { createReadStream } from 'fs'
import { createWriteStream } from 'fs'
import { renameSync } from 'fs'
import guardedSpawnSync from '../scripts/utility/guardedSpawnSync'

const HEADING_VALUE = 'Documentation'
const README_FILE = 'readme.md'
const AST_REPLACEMENT = {
	type: 'paragraph',
	children: [{
		type: 'text',
		value: `Documentation for ${version} can be found `
	}, {
		type: 'link',
		title: `Documentation for ${version}`,
		url: `https://mickvangelderen.github.io/function/${version}/`,
		children: [{
			type: 'text',
			value: 'here'
		}]
	}, {
		type: 'text',
		value: '.'
	}]
}

const processor = remark().use(function() {
	return function transformer(node) {
		if (node.type !== 'root') throw new Error('Expected root node.')

		const children = node.children
		const newChildren = []

		let i
		for (i = 0; i < children.length; i++) {
			newChildren.push(children[i])
			if (children[i].type === 'heading'
				&& children[i].children
				&& children[i].children.length === 1
				&& children[i].children[0].type === 'text'
				&& children[i].children[0].value === HEADING_VALUE) {
					break
			}
		}

		if (i === children.length) {
			throw new Error(`Heading "${HEADING_VALUE}" not found.`)
		}

		let j
		for (j = i + 1; j < children.length; j++) {
			if (children[j].type === 'heading' && children[j].depth <= children[i].depth) {
				newChildren.push(AST_REPLACEMENT)
				break
			}
		}

		for (; j < children.length; j++) {
			newChildren.push(children[j])
		}

		return Object.assign({}, node, {
			children: newChildren
		})
	}
})

createReadStream(README_FILE)
	.pipe(processor)
	.pipe(createWriteStream(README_FILE + '.temp'))
	.on('finish', () => {
			renameSync(README_FILE + '.temp', README_FILE)

			guardedSpawnSync('git', [ 'add', README_FILE ], {
				stdio: 'inherit'
			})
	})
