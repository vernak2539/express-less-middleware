var less = require( 'less' );
var fs   = require( 'fs' );
var url  = require( 'url' );

module.exports = function( req, res, next ) {

	getFileInfo( req, function( err, options ) {
		if( err ) return next(); // if the file is requested with anything but GET or it's not a CSS file

		fs.exists( url.resolve( __dirname, 'public' ) + options.path, function( exists ) {
			if( exists ) return next(); // if the CSS file exists, let it do it's thing

			var lessFilePath = url.resolve( __dirname, 'public' ) + options.path.replace( /\.css$/, '.less' );
			fs.exists(  lessFilePath, function( exists ) {
				if( !exists ) return next(); // if the less file doesn't exist, let it do it's thing

				fs.readFile( lessFilePath, 'utf-8', function( err, data ) {
					if( err ) {
						console.log( "LESS Middleware Compile: File could not be ready" );
						return next(); // if it's cant read the file data, go on and let the user know
					}

					// creating a less parser with the path that the file was found (for @imports)
					var filePathArrayLength = lessFilePath.split( '/' ).length;
					var parser = new( less.Parser )({
						paths: [
							lessFilePath.split( '/' ).slice( 0, filePathArrayLength - 1 ).join( '/' ) + '/'
						]
					});

					// parsing the file data we've loaded into css
					parser.parse( data, function( err, tree ) {
						if( err ) {
							console.log( "LESS Middleware Compile: File could not be read. ", lessFilePath );
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

	function getFileInfo( req, callback ) {
		// checking for get method and if file is a css file
		if( req.method.toLowerCase() === 'get' && Boolean( req.url.match( /\.css$/ ) ) ) {
			callback( null, {
				method: req.method,
				path: req.url
			});
		} else {
			callback( "method was not GET or not a CSS file", null );
		}
	}
};