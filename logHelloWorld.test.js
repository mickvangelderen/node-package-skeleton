/* eslint-env mocha, node */

import logHelloWorld from './logHelloWorld'
import expect from 'must'

describe('logHelloWorld', () => {

  it('should be a function', () => {
    expect(logHelloWorld).to.be.a.function()
  })

})
