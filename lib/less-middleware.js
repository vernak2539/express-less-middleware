var fs         = require( 'fs' );
var path       = require( 'path' );
var lessParser = require( './less-streaming-parser' );
var helpers    = require( './helpers' );

module.exports = function( config ) {
	'use strict';

	var newConfig = helpers.processOptions( config );
	var publicDir = newConfig.publicDir;
	var options   = newConfig.options;

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
