'use strict';

var bump       = require( 'gulp-bump' );
var complexity = require( 'gulp-complexity' );
var git        = require( 'gulp-git' );
var gulp       = require( 'gulp' );
var jshint     = require( 'gulp-jshint' );
var mocha      = require( 'gulp-mocha' );
var sequence   = require( 'run-sequence' );

var paths = {
	lib: './lib/**/*.js'
	, gulp: './gulpfile.js'
	, testSpec: './test/spec.js'
};

gulp.task( 'default', function(cb) {
	sequence('test', 'dist', cb);
});

gulp.task('dist', function(cb) {
	sequence('bump', 'tag', cb);
});

gulp.task( 'test', [ 'jshint', 'complexity', 'mocha' ] );

gulp.task( 'jshint', function() {
	return gulp.src([ paths.lib, paths.gulp ])
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( jshint.reporter( 'fail' ) );
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

gulp.task('bump', function() {
	return gulp.src('./package.json')
		.pipe(bump())
		.pipe(gulp.dest('./'));
});

gulp.task('tag', function() {
	var version = require('./package.json').version;
	var message = 'Release ' + version;

	return gulp.src('./*')
		.pipe(git.commit(message))
		.pipe(git.tag(version))
		// .pipe(git.push('origin', 'master', '--tags'))
		// .pipe(gulp.dest('./'));
});
