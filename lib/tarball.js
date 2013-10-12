'use strict';

/* jshint node: true */

var cp   = require('child_process');

/**
 * Create a gzipped tarball from a given folder.
 * @param {!string} outFile
 * @param {!function(error, outputFile)} callback
 */
exports.create = function (outFile, callback) {
  var cmd = 'tar -zcf /tmp/' + outFile + '.tar.gz -C /tmp ' + outFile + '/';

  cp.exec(cmd, function (err) {
    callback(err);
  });
};
