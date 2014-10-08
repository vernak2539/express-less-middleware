var fs         = require( 'fs' );
var path       = require( 'path' );
var lessParser = require( './less-streaming-parser' );
var helpers    = require( './helpers' );

module.exports = function( config ) {
	'use strict';

	var options   = config;
	var publicDir = null;
	var cwd       = process.cwd();

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

	return function( req, res, next ) {

		helpers.checkMethodAndFileType( req, function( err, filePath ) {
			if( err ) {
				return next();
			}

			fs.exists( path.join( publicDir, filePath ), function( exists ) {
				if( exists ) {
					return next();
				}

				var lessFilePath = path.join( publicDir, filePath ).replace( /\.css$/, '.less' );

				fs.exists( lessFilePath, function( exists ) {
					if( !exists ) {
						return next();
					}

					var lessStream          = fs.createReadStream( lessFilePath );
					var filePathArrayLength = lessFilePath.split( path.sep ).length;

					lessStream.setEncoding( 'utf8' );

					helpers.pushPath( options.paths, lessFilePath.split( path.sep ).slice( 0, filePathArrayLength - 1 ).join( path.sep ) + path.sep );

					res.setHeader( 'Content-Type', 'text/css; charset=utf-8' );

					lessStream
						.pipe(lessParser({
							parserOptions: options
							, fileToParse: lessFilePath
						}))
						.pipe( res );
				});
			});
		});
	};
};
