import express from 'express'
import morgan from 'morgan'

const server = express()

server.use(morgan('dev'))

server.use(express.static('lib/static'))

server.get(/\/[^.]*$/, (req, res) => {
	res.end(
`<!DOCTYPE html>
<html>
	<head>
		<title>Example Page</title>
		<link href="/index.css" rel="stylesheet" />
	</head>
	<body>
		<h1>Hello World</h1>
		<script src="/index.js"></script>
	</body>
</html>
`)
})

export default server
