
## Express LESS Middleware [![Build Status](https://travis-ci.org/vernak2539/express-less-middleware.svg?branch=master)](https://travis-ci.org/vernak2539/express-less-middleware) [![Coverage Status](https://coveralls.io/repos/vernak2539/express-less-middleware/badge.svg?branch=coveralls_support)](https://coveralls.io/r/vernak2539/express-less-middleware?branch=master)

This middleware is designed to compile LESS on the fly.

[![NPM](https://nodei.co/npm/express-less-middleware.png?downloads=true)](https://nodei.co/npm/express-less-middleware/)

### Installing

```js
npm install --save express-less-middleware
```

**Should only be used for development. LESS should be compiled during a build process**

### What this does (per request)

1. Determines if file requested is: (if conditions aren't met it runs `next()`)
    1. requested via GET method
    2. a CSS file
2. Looks for CSS file requested
    * if found it will let it go through the original flow via next
3. Looks for a LESS file with the same name as the CSS file requested
    * if LESS file is found it will read that file and compile it to CSS and deliever the response
4. If no LESS or CSS file is found, it will give you a 404 like usual

### What this doesn't do

1. Look for changes on save (if you use it, you won't need a grunt watch on less files)

### Setup

**lessMiddleware( options )**
* `options`
  * required: no
  * default: `./public` (string)
  * Type: `String` or `Object`
    * `String` - will be path to express public directory.__*__
    * `Object` - [less parser options][1]
      * `options.publicDir` - same value as if `options` were a string. Same default value
      * `options.paths`__*__


\* **paths should be relative to cwd.** `path.join` is used with `process.cwd()` as first argument when processing all paths

### Example

```js
var http    = require( 'http' );
var express = require( 'express' );
var app     = express();

// this assumes that the publicly available folder is on the same directory level
// as the file that starts your express server
var lessCompiler = require( 'express-less-middleware' )();

// if that's not the case, initialize it with the path to your public/client-side folder
// the path should be relative to the directory where the file that starts your express server is
// Example below.
//
//    var lessCompiler = require( 'express-less-middleware' );
//    lessCompiler     = lessCompiler( '../path/to/public/folder' );
// OR
//    var lessCompiler = require( 'express-less-middleware' );
//    lessCompiler     = lessCompiler({ publicDir: '../path/to/public/folder', ... });

// ....everything else that has to do with configuring

// you should only use this when developing. Not meant for production
if( process.env.NODE_ENV === 'dev' ) {
  // this must be "used" before express.use( express.static() ) or it will not work (no next())
  app.use( lessCompiler );
}

// ....other stuff relative to your express app

http.createServer( app ).listen( 8000 );
```

#### License

MIT

[1]: https://www.npmjs.org/package/less
