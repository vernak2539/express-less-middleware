var fs         = require( 'fs' );
var path       = require( 'path' );
var lessParser = require( './less-streaming-parser' );
var helpers    = require( './helpers' );

module.exports = function( publicDirectory ) {
	'use strict';

	// determining directory where main module has been started from and forming the path to the public directory
	// assumes that the client side directory of your app is called "public" and on the same level as the file you'd run to start your express server
	var expressStartPath = path.join( process.cwd(), publicDirectory || './public' );

	return function( req, res, next ) {

		helpers.checkMethodAndFileType( req, function( err, filePath ) {
			if( err ) {
				return next();
			}

			fs.exists( path.join( expressStartPath, filePath ), function( exists ) {
				if( exists ) {
					return next();
				}

				var lessFilePath = path.join( expressStartPath, filePath ).replace( /\.css$/, '.less' );

				fs.exists( lessFilePath, function( exists ) {
					if( !exists ) {
						return next();
					}

					var paths               = [];
					var lessStream          = fs.createReadStream( lessFilePath );
					var filePathArrayLength = lessFilePath.split( path.sep ).length;

					lessStream.setEncoding( 'utf8' );

					paths.push( lessFilePath.split( path.sep ).slice( 0, filePathArrayLength - 1 ).join( path.sep ) + path.sep );

					res.setHeader( 'Content-Type', 'text/css; charset=utf-8' );

					lessStream.pipe( lessParser({
						parserOptions: {
							paths: paths
						}
						, fileToParse: lessFilePath
					}) ).pipe( res );
				});
			});
		});
	};
};
