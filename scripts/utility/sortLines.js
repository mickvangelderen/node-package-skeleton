import { EOL } from 'os'

// Sort groups of non-empty lines.
export default function sortLines(input) {
	// Split the input string into parts.
	const parts = input.split(/(\r?\n|\r)/)

	// If the last part is empty, the last line contained a newline.
	if (parts[parts.length - 1] === '') {
		// Delete the empty match.
		parts.pop()
	} else {
		// Append a newline.
		parts[parts.length] = (parts.length - 2) >= 0
			? parts[parts.length - 2] // Use the previous newline.
			: EOL // Default to the standard newline for the current os.
	}

	// Split the parts into groups of lines separated by a single newline.
	const groups = [ [] ]
	let groupIndex = 0
	let groupTypeIsEmpty = true
	let i = 0
	while(i < parts.length) {
		const line = parts[i++]
		const ending = parts[i++]
		if ((line === '') !== groupTypeIsEmpty) {
			groups[++groupIndex] = []
			groupTypeIsEmpty = !groupTypeIsEmpty
		}
		groups[groupIndex].push({ line, ending })

	}

	// Concatentate groups, sort odd (non-empty line) groups.
	return groups
	.map((parts, index) =>
		(
			index % 2 === 0
				? parts
				: parts.sort((l, r) => l.line > r.line)
		)
		.map(({ line, ending }) => line + ending)
		.join('')
	)
	.join('')
}
