'use strict';

var through2 = require( 'through2' );
var less     = require( 'less' );

module.exports = function( options ) {

	return through2.obj( function( file, enc, cb ) {

		less
			.render(file, options.parserOptions)
			.then(function(res) {
				cb(null, res.css);
			})
			.catch(function(err) {
				err.lineNumber = err.line;
				err.filename   = ( err.filename === 'input' ) ? options.fileToParse : err.filename;
				err.message    = 'express-less-middleware:\n\n' + less.formatError( err );

				cb( null, err.message );
			})
			.then(null, cb);
	});
};
