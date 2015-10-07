'use strict';

var express = require( 'express' );

var lessCompilerNoConifg     = require('../lib/less-middleware')();
var lessCompilerStringConfig = require('../lib/less-middleware')( './public' );
var lessCompilerObjectConfig = require('../lib/less-middleware')({ publicDir: './public', paths: [ './test' ] });

var appNoConfig     = express();
var appStringConfig = express();
var appObjectConfig = express();

appNoConfig.use( lessCompilerNoConifg );
appStringConfig.use( lessCompilerStringConfig );
appObjectConfig.use( lessCompilerObjectConfig );

// string config
appNoConfig.get( '/css-files/sample-less.css' );

appNoConfig.get( '/css-files/sample.css', function( req, res ) {
	// we got here, so we know the compiler was bypassed
	res.setHeader( 'Content-Type', 'text/css; charset=utf-8' );
	res.status( 200 ).end();
});

appNoConfig.get( '/css-files/less-does-not-exist.css', function( req, res ) {
	res.status( 404 ).end();
});

appNoConfig.post( '/css-files/sample-less.css', function( req, res ) {
	res.status( 200 ).end();
});

appNoConfig.get( '/css-files/parse-error' );

// object + string configs
appStringConfig.get( '/css-files/sample-less.css' );
appObjectConfig.get( '/css-files/sample-less.css' );

module.exports = {
	configNone: appNoConfig
	, configString: appStringConfig
	, configObject: appObjectConfig
};
