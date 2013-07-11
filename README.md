Konf
=====

A runtime configuration loader for node apps.

    npm install konf

It's purpose is to allow moving seamlessly from configuration files to `process.env` variables. When deploying to SaaS
platforms like Heroku/Nodejitsu/etc non-versioned file uploads are not a possibility. Konf allows you to fallback to environment variables without any changes to your code.

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
from properties on `process.env`. The correspondent environment keys will be:

    APP_DOMAIN
    AUTH_CALLBACK
    TWITTER_KEY
    TWITTER_SECRET

Note that environment variables are case-insensitive, but they are converted from `camelCase` to `snake_case`.

#### License

[MIT](http://ricardo.mit-license.org)
