'use strict';

var through2 = require( 'through2' );
var less     = require( 'less' );

module.exports = function( options ) {

	return through2.obj( function( file, enc, cb ) {

		less.render( file, options, function( err, css ) {
			if( err ) {
				err.lineNumber = err.line
				err.fileName   = err.filename;
				err.message    = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

				return cb( null, 'express-less-middleware: ' + err.message );
			}

			cb( null, css );
		});
	});
};
