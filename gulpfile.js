"use strict";

var gulp = require("gulp");
var jshint = require("gulp-jshint");
var mocha = require("gulp-mocha");

var paths = {
  lib: "./lib/**/*.js",
  gulp: "./gulpfile.js",
  testSpec: "./test/spec.js",
  tests: "./test/**/*.js"
};

gulp.task("default", ["test"]);
gulp.task("test", ["jshint", "mocha"]);

gulp.task("jshint", function() {
  return gulp
    .src([paths.lib, paths.gulp, paths.tests])
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"));
});

// only doing this at the end so the logs don't get messed up by other tasks going
gulp.task("mocha", ["jshint"], function() {
  return gulp.src(paths.testSpec, { read: false }).pipe(
    mocha({
      reporter: "spec"
    })
  );
});
