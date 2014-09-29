'use strict';

var express      = require( 'express' );
var lessCompiler = require('../lib/less-middleware')('./test');

var app = express();


app.use( lessCompiler );

app.get( '/css-files/sample-less.css' );

app.get( '/css-files/sample.css', function( req, res ) {
	// we got here, so we know the compiler was bypassed
	res.setHeader( 'Content-Type', 'text/css; charset=utf-8' );
	res.status( 200 ).end();
});

app.get( '/css-files/less-does-not-exist.css', function( req, res ) {
	res.status( 404 ).end();
})

app.post( '/css-files/sample-less.css', function( req, res ) {
	res.status( 200 ).end();
});

app.get( '/css-files/parse-error' );

module.exports = app;
