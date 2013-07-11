assert = require 'assert'
fs     = require 'fs'

Konf = require '../'

### ----------------------------------------------------------------------- ###

suite 'environment variables', ->

    test 'load from process.env', ->
        process.env.BACON = 1
        konf = new Konf().describe { bacon: 'is good' }
        assert.deepEqual konf.env().toJSON(), { bacon: 1 }

    test 'are case-insensitive', ->
        process.env.bACoN = 111
        process.env.niL = 333
        konf = new Konf().describe { bacon: 'is good', nil: '' }
        assert.deepEqual konf.env().toJSON(), {
            bacon: 111
            nil: 333
        }

    test 'but preserve default casing', ->
        process.env.TeST_keY = 111
        process.env.nil = 333
        konf = new Konf().describe { testKey: 'is good', NIL: 'should' }
        assert.deepEqual konf.env().toJSON(), {
            testKey: 111
            NIL: 333
        }

### ----------------------------------------------------------------------- ###

suite 'load from file', ->

    url = 'http://ricardo.cc'
    date = '2012-12-04'

    setup ->
        fs.writeFileSync './test/config.json', """{
            "url": "#{url}"
          , "date": "#{date}"
          , "json": true
        }"""
        fs.writeFileSync './test/config.js', """module.exports = {
            url: '#{url}'
          , date: '#{date}'
          , js: true
        }"""
        fs.writeFileSync './test/config.coffee', """module.exports = {
            url: '#{url}'
            date: '#{date}'
            coffee: yes
        }"""

    teardown ->
        fs.unlinkSync './test/config.json'
        fs.unlinkSync './test/config.js'
        fs.unlinkSync './test/config.coffee'

    test '.json file', ->
        config = new Konf().load('./test/config.json').toJSON()
        assert config.json
        assert.equal config.url, url
        assert.equal config.date, date

    test '.js file', ->
        config = new Konf().load('./test/config.js').toJSON()
        assert config.js
        assert.equal config.url, url
        assert.equal config.date, date

    test '.coffee file', ->
        config = new Konf().load('./test/config.coffee').toJSON()
        assert config.coffee
        assert.equal config.url, url
        assert.equal config.date, date

    test '.js comes first', ->
        config = new Konf().load('./test/config').toJSON()
        assert config.js

### ----------------------------------------------------------------------- ###

suite 'precedence', ->

    setup ->
        fs.writeFileSync './test/config2.json', JSON.stringify({ shadow: 222 })

    teardown ->
        fs.unlinkSync './test/config2.json'

    test 'environment variables shadow files', ->
        konf = new Konf().describe { shadow: '' }
        process.env.shadow = 555
        konf.load('./test/config2')
        assert.deepEqual konf.toJSON(), { shadow: 222 }
        konf.env()
        assert.deepEqual konf.toJSON(), { shadow: 555 }

    test 'file variables shadow env', ->
        konf = new Konf().describe { shadow: '' }
        process.env.shadow = 555
        konf.env()
        assert.deepEqual konf.toJSON(), { shadow: 555 }
        konf.load('./test/config2')
        assert.deepEqual konf.toJSON(), { shadow: 222 }
