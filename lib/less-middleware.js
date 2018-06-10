const fs = require('fs');
const path = require('path');
const async = require('async');
const lessParser = require('./less-streaming-parser');
const helpers = require('./helpers');

module.exports = config => {
	const newConfig = helpers.processOptions(config);
	const publicDir = newConfig.publicDir;
	const options = newConfig.options;

	return (req, res, next) => {
		async.waterfall(
			[
				// checking the request method and file type of that request
				cb => {
					helpers.checkMethodAndFileType(req, (err, filePath) => {
						if (err) {
							cb(err, null);
							return;
						}
						cb(null, filePath);
					});
				},
				// checking the request matches an existing CSS file
				(filePath, cb) => {
					fs.exists(path.join(publicDir, filePath), exists => {
						var lessFilePath;

						// serve CSS file if it exists (let express do the serving)
						if (exists) {
							cb({ err: 'css file exists' }, null);
							return;
						}

						// mimicing a less file at the same path as requested asset
						lessFilePath = path.join(publicDir, filePath).replace(/\.css$/, '.less');

						cb(null, lessFilePath);
					});
				},
				// checking for LESS file with same path as requested assest (with .less extension)
				(lessFilePath, cb) => {
					fs.exists(lessFilePath, (exists) => {
						if (!exists) {
							cb({ err: 'LESS file does not exist' }, null);
							return;
						}

						cb(null, lessFilePath);
					});
				}
				// deciding what to do based on functions before. Either return next() and
				// pass off to Express, or deliever parsed LESS content
			],
			(err, lessFilePath) => {
				var lessStream, filePathArrayLength;

				if (err) {
					return next(); // pass back to express
				}

				lessStream = fs.createReadStream(lessFilePath);
				filePathArrayLength = lessFilePath.split(path.sep).length;

				lessStream.setEncoding('utf8');

				helpers.pushPath(
					options.paths,
					lessFilePath
						.split(path.sep)
						.slice(0, filePathArrayLength - 1)
						.join(path.sep) + path.sep
				);

				res.setHeader('Content-Type', 'text/css; charset=utf-8');

				// pipe parsed content to response
				lessStream
					.pipe(
						lessParser({
							parserOptions: options,
							fileToParse: lessFilePath
						})
					)
					.pipe(res);
			}
		);
	};
};
