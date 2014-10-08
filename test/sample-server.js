'use strict';

var express  = require( 'express' );
var lcString = require('../lib/less-middleware')('./test');
var lcObj    = require('../lib/less-middleware')({ publicDir: './test', paths: [ './public' ] });

var objConfig    = express();
var stringConfig = express();

stringConfig.use( lcString );
objConfig.use( lcObj );

// string config
stringConfig.get( '/css-files/sample-less.css' );

stringConfig.get( '/css-files/sample.css', function( req, res ) {
	// we got here, so we know the compiler was bypassed
	res.setHeader( 'Content-Type', 'text/css; charset=utf-8' );
	res.status( 200 ).end();
});

stringConfig.get( '/css-files/less-does-not-exist.css', function( req, res ) {
	res.status( 404 ).end();
})

stringConfig.post( '/css-files/sample-less.css', function( req, res ) {
	res.status( 200 ).end();
});

stringConfig.get( '/css-files/parse-error' );

// object config
objConfig.get( '/css-files/sample-less.css' );

module.exports = {
	stringServer: stringConfig
	, objServer: objConfig
};
