var util     = require('util')
  , path     = require('path')
  , flatKeys = require('flatkeys')
  , table    = require('text-table')
  , colors   = require('colors')

// Konf
// ----------------------------------------------------------------------------

// *Copyright Ricardo Tomasi, 2013 <ricardobeat@gmail.com>*
// *MIT* Licensed (see http://ricardo.mit-license.org)

// *Konf* is a runtime configuration loader for node apps. It's purpose is to allow moving
// seamlessly from configuration files to `process.env` variables, for deployment on SaaS
// platforms like Heroku/Nodejitsu/etc where non-versioned file uploads are not a possibility.

function Konf (options) {
    options = util._extend(Konf.defaults, options)
    this.sep = options.sep
    this.schema = {}
    this.values = {}
}

Konf.defaults = {
    sep: '_'
}


// konf.describe
// ----------------------------------------------------------------------------

// Set the config keys, use value as description.

Konf.prototype.describe = function (obj) {
    util._extend(this.schema, obj)
    return this
}


// konf.defaults
// ----------------------------------------------------------------------------

// Set default values, and add any non-described keys to the schema.

Konf.prototype.defaults = Konf.prototype.set = function (obj) {
    util._extend(this.values, obj)
    Object.keys(this.values).forEach(function(key){
        if (!(key in this.schema)) this.schema[key] = '?'
    }.bind(this))
    return this
}


// konf.env
// ----------------------------------------------------------------------------

// Load values from `process.env`, ignoring case, but preserving original case
// from describe/defaults.

Konf.prototype.env = function () {
    var keys = flatKeys(this.schema, { sep: '.' })
      , keysUpper = flatKeys(this.schema, { sep: this.sep, filter: String.prototype.toUpperCase })
      , self = this

    Object.keys(process.env).forEach(function(key){
        var index = keysUpper.indexOf(key.toUpperCase())
        if (index >= 0) {
            var parts = keys[index].split('.')
              , _key = parts.pop()
              , obj = self.values
              , part
            while (part = parts.shift()) obj = obj[part] || (obj[part] = {})
            obj[_key] = process.env[key]
        }
    })
    return this
}


// konf.load
// ----------------------------------------------------------------------------

// Load values from file.
// TODO: load TOML/INI/YAML files

Konf.prototype.load = function (file, dir) {
    this.lastFile = file
    var dir  = path.resolve(process.cwd(), dir || '')
      , file = path.join(dir, file)

    try { this.set(require(file)) } catch (e) {}
    return this
}


// konf.validate
// ----------------------------------------------------------------------------

// Checks for missing keys as added in describe() or defaults() calls. Causes the
// process to exit if a config key is missing.

Konf.prototype.validate = function () {
    if (this.validated) return this

    var self   = this
      , opts   = { object: true, sep: '.' }
      , values = flatKeys(this.values, { object: true, sep: '.' })
      , schema = flatKeys(this.schema, { object: true, sep: '.' })

    var missing = Object.keys(schema).reduce(function (missing, key) {
        if (values[key] == null) {
            missing.push([
                key.yellow
              , key.replace('.', '_').toUpperCase().grey
              , schema[key]
            ])
        }
        return missing
    }, [])

    if (missing.length > 0) {
        console.error("\nMissing config vars:\n".red.inverse)
        console.error(table(missing) + "\n")
        console.error("Please verify your " + this.lastFile.blue + " file or environment variables.\n")
        process.exit(1)
        return
    }

    this.validated = true
    return this
}


// konf.get
// ----------------------------------------------------------------------------

// Get a single value by key.

Konf.prototype.get = function (key) {
    this.validate()
    return this.values[key]
}


// konf.toJSON
// ----------------------------------------------------------------------------

// Return key-value map.

Konf.prototype.toJSON = function () {
    this.validate()
    return this.values
}


// Exports
// ----------------------------------------------------------------------------

module.exports = Konf
