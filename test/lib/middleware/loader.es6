'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

import load from '../../../lib/middleware/loader'

describe('Middlware loader', function() {
    let app

    beforeEach(function () {
        app = {
            use: sinon.spy()
        }
    })

    it('Default export should be a method', function () {
        expect(load).to.be.a('function')
    })

    it('Calling loader for non existing middleware should throw an error', function () {
        expect((function () {
            load(app, {
                enabled: ['non-existing']
            })
        })
        ).to.throw(/could not be found/)

        expect(app.use).to.not.have.been.called

    })

    it('Calling loader for existing middleware should load it and call use of app', function () {
        load(app, {
            paths: ['.'],
            enabled: ['stats']
        })

        expect(app.use).to.have.been.calledOnce
    })
})