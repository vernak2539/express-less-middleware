var fs   = require( 'fs' );
var path = require( 'path' );
var less = require( 'less' );

var assert = require('assert');
var sinon  = require('sinon');

describe('less-middleware', function() {
	describe('getFileInfo', function() {
		it('is sent the wrong http method', function() {
			var req = {
				method: "POST"
				, url: "/path/to/file.css"
			};
			var res = {};
			var next = sinon.spy();

			var classUnderTest = require('../lib/less-middleware')('path');

			classUnderTest(req, res, next);

			assert(next.calledOnce);
		});
		it('is not sent a css file path', function() {
			var req = {
				method: "GET"
				, url: "/path/to/file.html"
			};
			var res = {};
			var next = sinon.spy();

			// not passing a path here to get 100% coverage
			var classUnderTest = require('../lib/less-middleware')();

			classUnderTest(req, res, next);

			assert(next.calledOnce);
		});
		it('is sent an invalid css file path', function() {
			var req = {
				method: "GET"
				, url: "/path/to/file.css"
			};
			var res = {};
			var next = sinon.spy();

			sinon.stub(fs, 'exists', function(path, cb) {
				cb(true);
			});

			var classUnderTest = require('../lib/less-middleware')('path');

			classUnderTest(req, res, next);

			assert(next.calledOnce);
			fs.exists.restore();
		});
		it('is sent an invalid less file path', function() {
			var req = {
				method: "GET"
				, url: "/path/to/file.css"
			};
			var res = {};
			var next = sinon.spy();
			sinon.stub(fs, 'exists', function(path, cb) {
				cb(false);
			});

			var classUnderTest = require('../lib/less-middleware')('path');

			classUnderTest(req, res, next);

			assert(next.calledOnce);
			fs.exists.restore();
		});
		it('is unable to read less file', function() {
			var req = {
				method: "GET"
				, url: "/path/to/file.css"
			};
			var res = {};
			var next = sinon.spy();
			var exists = sinon.stub(fs, 'exists');
			exists.yields(false);
			exists.yields(true);
			sinon.stub(fs, 'readFile', function(path, enc, cb) {
				cb('this is an error message', null);
			});
			sinon.stub(console, 'log').returns( true );

			var classUnderTest = require('../lib/less-middleware')('path');

			classUnderTest(req, res, next);

			assert(next.calledOnce);
			fs.exists.restore();
			fs.readFile.restore();
			console.log.restore();
		});
		it('is unable to parse less file', function() {
			var req = {
				method: "GET"
				, url: "/path/to/file.css"
			};
			var res = {};
			var next = sinon.spy();
			var exists = sinon.stub(fs, 'exists');
			exists.yields(false);
			exists.yields(true);
			var lessPath;

			sinon.stub(fs, 'readFile', function(path, enc, cb) {
				cb(undefined, 'parseable data');
			});
			sinon.stub(less, 'Parser', function(options) {
				lessPath = options.paths[0];
				return {
					parse: function(data, cb) {
						cb('error parsing', 'filePath');
					}
				}
			});
			sinon.stub( console, 'log' ).returns( true );

			var classUnderTest = require('../lib/less-middleware')('path');

			classUnderTest(req, res, next);

			assert(next.calledOnce);
			var strippedUrl = req.url.substr(0, req.url.lastIndexOf('/') + 1);
			assert.equal(strippedUrl, lessPath.substr(lessPath.indexOf(strippedUrl)));

			fs.exists.restore();
			fs.readFile.restore();
			less.Parser.restore();
			console.log.restore();
		});
		it('is sent a valid less file that is successfully parsed and css is returned', function() {
			var req = {
				method: "GET"
				, url: "/path/to/file.css"
			};
			var res = {
				setHeader: function(title, contentType) { }
				, send: function(data) { }
			};
			var resHeadSpy = sinon.spy(res, 'setHeader');
			var resSendSpy = sinon.spy(res, 'send');
			var next = sinon.spy();
			var exists = sinon.stub(fs, 'exists');
			exists.yields(false);
			exists.yields(true);
			var toCSS = sinon.stub();
			var lessPath;

			sinon.stub(fs, 'readFile', function(path, enc, cb) {
				cb(undefined, 'parseable data');
			});
			sinon.stub(less, 'Parser', function(options) {
				lessPath = options.paths[0];
				return {
					parse: function(data, cb) {
						cb(undefined, { toCSS: toCSS });
					}
				}
			});

			var classUnderTest = require('../lib/less-middleware')('path');

			classUnderTest(req, res, next);

			assert(next.notCalled);
			var strippedUrl = req.url.substr(0, req.url.lastIndexOf('/') + 1);
			assert.equal(strippedUrl, lessPath.substr(lessPath.indexOf(strippedUrl)));
			assert(toCSS.called);
			assert(resHeadSpy.calledOnce);
			assert(resSendSpy.calledOnce);

			fs.exists.restore();
			fs.readFile.restore();
			less.Parser.restore();
		});
	});
});
