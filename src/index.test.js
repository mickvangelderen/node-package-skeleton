/* eslint-env mocha */
import EXAMPLE_VARIABLE from './config/EXAMPLE_VARIABLE'
import expect from 'must'
import hello from './'
import relativePath from '../test/relative-path'

describe(relativePath(__filename), () => {
	it('should export a function', () => {
		expect(hello).to.be.a.function()
	})

	it(`should return "${EXAMPLE_VARIABLE}" when called`, () => {
		expect(hello()).to.equal(EXAMPLE_VARIABLE)
	})
})
