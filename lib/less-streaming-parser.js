'use strict';

var through2 = require( 'through2' );
var less     = require( 'less' );

module.exports = function( options ) {

	return through2.obj( function( file, enc, cb ) {

		less.render( file, options.parser, function( err, css ) {

			if( err ) {
				err.lineNumber = err.line;
				err.filename   = ( err.filename === 'input' ) ? options.fileToParse : err.filename;
				err.message    = 'express-less-middleware: ' + less.formatError( err );

				return cb( null, err.message );
			}

			cb( null, css );
		});
	});
};
