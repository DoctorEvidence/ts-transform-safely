import compile from '../compile'
import { resolve } from 'path'
import { expect } from 'chai'

describe('ts-transform-safely', function () {
    this.timeout(5000)
    it('should be able to compile safely', function () {
        compile(resolve(__dirname, 'fixture/*.ts'))
        expect(require('./fixture/index.js')).to.deep.equal({
        })
    })
})
