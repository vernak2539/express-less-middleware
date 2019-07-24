"use strict";

const request = require("supertest");
const assert = require("assert");

const app = require("./sample-server").configNone;
const appStringConfig = require("./sample-server").configString;
const appObjectConfig = require("./sample-server").configObject;

const compressResult = result => {
  return result.replace(/\n/g, "").replace(/\s{2,}/g, " ");
};

const assertCompiled = done => {
  return (err, res) => {
    if (err) {
      done(err);
    }

    var result = compressResult(res.text);

    assert.equal(result, ".test .test-inside { color: white;}");
    done();
  };
};

describe("Express LESS Middleware", () => {
  it("should deliver compiled LESS file", done => {
    request(app)
      .get("/css-files/sample-less.css")
      .expect("Content-Type", "text/css; charset=utf-8")
      .expect(200)
      .end(assertCompiled(done));
  });

  it("should deliver compiled LESS file when configured with string as options", done => {
    request(appStringConfig)
      .get("/css-files/sample-less.css")
      .expect("Content-Type", "text/css; charset=utf-8")
      .expect(200)
      .end(assertCompiled(done));
  });

  it("should deliver compiled LESS file when configured with object as options", done => {
    request(appObjectConfig)
      .get("/css-files/sample-less.css")
      .expect("Content-Type", "text/css; charset=utf-8")
      .expect(200)
      .end(assertCompiled(done));
  });

  it("should deliver parse error", done => {
    request(app)
      .get("/css-files/parse-error.css")
      .end((err, res) => {
        if (err) {
          done(err);
        }

        var expectedResult = !!res.text.match(/^express\-less\-middleware\:/);

        assert(expectedResult, true);
        done();
      });
  });

  it("should not deliver compiled LESS on POST requests", done => {
    request(app)
      .post("/css-files/sample-less.css")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        assert.equal(res.text, "");
        done();
      });
  });

  it("should not do anything on requests for CSS files", done => {
    request(app)
      .get("/css-files/sample.css")
      .expect("Content-Type", "text/css; charset=utf-8")
      .expect(200, done);
  });

  it("should not try to read LESS file if CSS file and LESS file do not exist", done => {
    request(app)
      .get("/css-files/less-does-not-exist.css")
      .expect(404, done);
  });
});
