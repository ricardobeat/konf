var util     = require('util')
  , path     = require('path')
  , flatKeys = require('flatkeys')

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
    var keys = Object.keys(this.schema)
      , keysUpper = flatKeys(this.schema, { sep: this.sep, filter: String.prototype.toUpperCase })
      , self = this

    Object.keys(process.env).forEach(function(key){
        var index = keysUpper.indexOf(key.toUpperCase())
        if (index >= 0) self.values[keys[index]] = process.env[key]
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

// Return key-value map.
Konf.prototype.toJSON = function () {
    return this.values
}


// Exports
// ----------------------------------------------------------------------------

module.exports = Konf
