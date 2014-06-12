var fs   = require( 'fs' );
var path = require( 'path' );
var less = require( 'less' );

module.exports = function( publicDirectory ) {
	'use strict';

	// determining directory where main module has been started from and forming the path to the public directory
	// assumes that the client side directory of your app is called "public" and on the same level as the file you'd run to start your express server
	var expressStartPath = path.join( path.dirname( require.main.filename ), publicDirectory || './public' );

	var getFileInfo = function( req, callback ) {
		// checking for get method and if file is a css file
		if( req.method.toLowerCase() === 'get' && Boolean( req.url.match( /\/[a-zA-Z_0-9\-\.]+\.css/ ) ) ) {
			callback( null, {
				method: req.method,
				path: req.url.split( '?' )[ 0 ].split( '#' )[ 0 ]
			});
		} else {
			callback( "method was not GET or not a CSS file", null );
		}
	};

	return function( req, res, next ) {

		getFileInfo( req, function( err, options ) {
			// if the file is requested with anything but GET or it's not a CSS file
			if( err ) return next();

			fs.exists( path.join( expressStartPath, options.path ), function( exists ) {
				// if the CSS file exists, let it do it's thing
				if( exists ) return next();

				// creating file path for less file with same name as css file
				var lessFilePath = path.join( expressStartPath, options.path ).replace( /\.css$/, '.less' );

				fs.exists( lessFilePath, function( exists ) {
					// if the less file doesn't exist, let it do it's thing
					if( !exists ) return next();

					fs.readFile( lessFilePath, 'utf-8', function( err, data ) {
						if( err ) {
							console.log( "Express LESS Middleware: File could not be read." );
							return next(); // if it's cant read the file data, go on and let the user know
						}

						// figuring out length of array so i can slice off the last arugement when putting it back together
						var filePathArrayLength = lessFilePath.split( path.sep ).length;

						// creating a less parser with the path that the file was found (for @imports)
						var parser = new( less.Parser )({
							paths: [ lessFilePath.split( path.sep ).slice( 0, filePathArrayLength - 1 ).join( path.sep ) + path.sep ]
						});

						// parsing the file data we've loaded into css
						parser.parse( data, function( err, tree ) {
							if( err ) {
								console.log( "Express LESS Middleware: LESS could not be compiled. Error:\n", err );
								return next();
							}

							// sending back what we compiled
							res.setHeader( 'Content-Type', 'text/css; charset=UTF-8' );
							res.send( tree.toCSS() );
						});
					});
				});
			});
		});
	};
};