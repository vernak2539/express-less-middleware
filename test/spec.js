'use strict';

var request = require( 'supertest' );
var assert  = require( 'assert' );

var app             = require( './sample-server' ).stringServer;
var appObjectConfig = require( './sample-server' ).objServer;

describe( 'Express LESS Middleware', function() {

	it( 'should deliver compiled LESS file', function( done ) {
		request( app )
			.get( '/css-files/sample-less.css' )
			.expect( 'Content-Type', 'text/css; charset=utf-8' )
			.expect( 200 )
			.end( function( err, res ) {
				if( err ) {
					done( err );
				}

				var result = compressResult( res.text );

				assert.equal( result, '.test .test-inside { color: white;}' );
				done();
			});
	});

	it( 'should deliver compiled LESS file when configured with object as options', function( done ) {
		request( appObjectConfig )
			.get( '/css-files/sample-less.css' )
			.expect( 'Content-Type', 'text/css; charset=utf-8' )
			.expect( 200 )
			.end( function( err, res ) {
				if( err ) {
					done( err );
				}

				var result = compressResult( res.text );

				assert.equal( result, '.test .test-inside { color: white;}' );
				done();
			});
	});

	it( 'should deliver parse error', function( done ) {
		request( app )
			.get( '/css-files/parse-error.css' )
			.end( function( err, res ) {
				if( err ) {
					done( err )
				}

				var expectedResult = !!res.text.match( /^express\-less\-middleware\:/ )

				assert( expectedResult, true );
				done();
			});
	});

	it( 'should not deliver compild LESS on POST requests', function( done ) {
		request( app )
			.post( '/css-files/sample-less.css' )
			.expect( 200 )
			.end( function( err, res ) {
				if( err ) {
					done( err );
				}

				assert.equal( res.text, '' );
				done();
			});
	});

	it( 'should not do anything on requests for CSS files', function( done ) {
		request( app )
			.get( '/css-files/sample.css' )
			.expect( 'Content-Type', 'text/css; charset=utf-8' )
			.expect( 200, done );
	});

	it( 'should not try to read LESS file if CSS file and LESS file do not exist', function( done ) {
		request( app )
			.get( '/css-files/less-does-not-exist.css' )
			.expect( 404, done );
	});
});


function compressResult( result ) {
	return result.replace( /\n/g, '' ).replace( /\s{2,}/g, ' ' );
}
