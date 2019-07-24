"use strict";

const url = require("url");
const path = require("path");
const isPlainObj = require("lodash.isplainobject");

module.exports = {
  checkMethodAndFileType: (req, callback) => {
    if (
      req.method.toLowerCase() === "get" &&
      Boolean(req.url.match(/\/[a-zA-Z_0-9\-\.]+\.css/))
    ) {
      callback(null, url.parse(req.url).pathname);
    } else {
      callback(
        new Error(
          "File requested was not a CSS file or request method was not GET"
        ),
        null
      );
    }
  },
  pushPath: (array, string) => {
    if (array.indexOf(string) === -1) {
      array.push(string);
    }
  },
  processOptions: config => {
    const cwd = process.cwd();
    let publicDir = null;
    let options = {};

    config = config || "./public";

    if (isPlainObj(config)) {
      publicDir = config.publicDir || "./public";
      options = config;
    }

    if (typeof config === "string") {
      publicDir = config;
    }

    if (config && config.publicDir) {
      publicDir = config.publicDir;
    }

    publicDir = path.join(cwd, publicDir);

    if (Array.isArray(options.paths)) {
      options.paths.forEach(function(importPath, index) {
        options.paths[index] = path.join(cwd, importPath);
      });
    } else {
      options.paths = [];
    }

    delete options.publicDir;

    return {
      options: options,
      publicDir: publicDir
    };
  }
};
