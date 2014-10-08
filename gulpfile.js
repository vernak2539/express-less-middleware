'use strict';

var gulp       = require( 'gulp' );
var jshint     = require( 'gulp-jshint' );
var complexity = require( 'gulp-complexity' );
var mocha      = require( 'gulp-mocha' );

var paths = {
	lib: './lib/**/*.js'
	, gulp: './gulpfile.js'
	, testSpec: './test/spec.js'
};

gulp.task( 'default', [ 'test' ] );
gulp.task( 'test', [ 'jshint', 'complexity', 'mocha' ] );

gulp.task( 'jshint', function() {
	return gulp.src([ paths.lib, paths.gulp ])
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) );
});

gulp.task( 'complexity', function() {
	return gulp.src( [ paths.lib, '!./lib/helpers.js' ] )
		.pipe( complexity({
			cyclomatic: 10 // recommendation 10
			, halstead: 12 // no recommendation
			, maintainability: 100 // recommendation 65
		}) );
});

// only doing this at the end so the logs don't get messed up by other tasks going
gulp.task( 'mocha', [ 'jshint', 'complexity' ], function() {
	return gulp.src( paths.testSpec, { read: false })
		.pipe( mocha({
			reporter: 'spec'
		}) );
});
