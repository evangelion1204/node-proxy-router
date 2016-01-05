'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import FilterBuilder from '../../../src/filter/builder'
import CookieFilter from '../../../src/filter/cookie'

chai.use(sinonChai)


describe('Filter builder', function() {
    it('should be available', function () {
        expect(FilterBuilder).to.be.a('function')
    })

    it('loadFilter should load filter', function () {
        let builder = new FilterBuilder()

        expect(builder.loadFilter('Cookie') === CookieFilter).to.be.truthy
    })

    it('buildFilters should load and init filters', function () {
        let builder = new FilterBuilder()

        let filterInitializer = sinon.stub()
        filterInitializer.returns('filter')

        builder.loadFilter = sinon.stub().returns(filterInitializer)

        let filters = builder.buildFilters([{name: 'Cookie', args: ['param']}])

        expect(filterInitializer).to.be.calledWith('param')
        expect(filters.length).to.be.equal(1)
        expect(filters).to.contain('filter')
    })
})