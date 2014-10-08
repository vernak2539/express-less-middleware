'use strict';

var url  = require( 'url' );
var path = require( 'path' );

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
	, processOptions: function( config ) {
		var cwd       = process.cwd();
		var options   = config;
		var publicDir = null;

		// determining directory where main module has been started from and forming the path to the public directory
		// assumes that the client side directory of your app is called "public" and on the same level as the file you'd run to start your express server
		if( typeof config === 'string' ) {
			options = {};
			options.publicDir = config;
		}

		publicDir = path.join( cwd, options.publicDir || './public' );

		if( Array.isArray( options.paths ) ) {
			options.paths.forEach( function( importPath, index ) {
				options.paths[ index ] = path.join( cwd, importPath );
			});
		} else {
			options.paths = [];
		}

		delete options.publicDir;

		return {
			options: options
			, publicDir: publicDir
		};
	}
};
