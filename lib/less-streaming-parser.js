"use strict";

const through2 = require("through2");
const less = require("less");

module.exports = options => {
  return through2.obj((file, enc, cb) => {
    less
      .render(file, options.parserOptions)
      .then(res => cb(null, res.css))
      .catch(err => {
        err.lineNumber = err.line;
        err.filename =
          err.filename === "input" ? options.fileToParse : err.filename;
        err.message = "express-less-middleware:\n\n" + err.toString();

        cb(null, err.message);
      })
      .then(null, cb);
  });
};
