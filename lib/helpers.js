'use strict';

var url = require( 'url' );

module.exports = {
	checkMethodAndFileType: function( req, callback ) {
		if( req.method.toLowerCase() === 'get' && Boolean( req.url.match( /\/[a-zA-Z_0-9\-\.]+\.css/ ) ) ) {
			callback( null, url.parse( req.url ).pathname );
		} else {
			callback( new Error("File requested was not a CSS file or request method was not GET"), null );
		}
	}
	, pushPath: function( array, string ) {
		if( array.indexOf( string ) === -1 ) {
			array.push( string );
		}
	}
};
