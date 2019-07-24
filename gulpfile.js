"use strict";

var gulp = require("gulp");
var mocha = require("gulp-mocha");

var paths = {
  testSpec: "./test/spec.js"
};

gulp.task("default", ["test"]);
gulp.task("test", ["mocha"]);

// only doing this at the end so the logs don't get messed up by other tasks going
gulp.task("mocha", function() {
  return gulp.src(paths.testSpec, { read: false }).pipe(
    mocha({
      reporter: "spec"
    })
  );
});
