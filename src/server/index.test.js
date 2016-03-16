/* eslint-env mocha */
import expect from 'must'
import relativePath from '../../test/relative-path'
import server from './'

describe(relativePath(__filename), () => {
	it('should be a function', () => {
		expect(server).to.be.a.function()
	})

	it(`should have a listen property that is a function`, () => {
		expect(server).to.have.property('listen')
		expect(server.listen).to.be.a.function()
	})
})
