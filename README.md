Konf
=====

A runtime configuration loader for node apps.

    npm install konf

It's purpose is to allow moving seamlessly from configuration files to `process.env` variables. When deploying to SaaS
platforms like Heroku/Nodejitsu/etc non-versioned file uploads are not a possibility. Konf allows you to fallback to environment variables without any changes to your code.

It's also self-documenting, so users installing your application have clear instructions to follow:

![screenshot](http://f.cl.ly/items/0d3p3z2n1g2I182i1l0K/Image%202013.07.11%203%3A26%3A02%20AM.png)

Usage
------

    var Konf = require('konf')

    var config = new Konf().describe({
        appDomain: "The application domain/host name"
      , authCallback: "OAuth callback"
      , twitter: {
            key: "Twitter API key"
            secret: "Twitter API secret"
      }
    }).load('./config').env()

This will attemp to populate the given config values first from `./config.(js|json|coffee)` file and then
from properties on `process.env`. Environment keys are automatically converted from *camelCase* to *snake_case*,
and are case-insensitive.

### Defaults

Default values can be set either by calling the `defaults` method:

    var config = new Konf().describe({
        appname: 'Application name'
    }).defaults({
        appname: 'testapp'
    }).load('./config')

Or, for convenience, by passing a `[description, defaultValue]` array to each key in the `describe` call:

    var config = new Konf().describe({
        appname: ['Application name', 'testapp']
    }).load('./config')

Keep in mind that keys with a default value set will not trigger any warnings when missing from specified config files.

#### License

[MIT](http://ricardo.mit-license.org)
