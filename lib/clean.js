'use strict';

/* jshint node: true */

var fs     = require('fs');
var rimraf = require('rimraf');

/**
 * Remove the temporary source directory and the tarball archive.
 * @param {!string} outFile
 * @param {!function()} cb
 */
module.exports = function (outFile, cb) {
  if (fs.existsSync('/tmp/' + outFile)) {
    rimraf.sync('/tmp/' + outFile);
  }

  if (fs.existsSync('/tmp/' + outFile + '.tar.gz')) {
    fs.unlinkSync('/tmp/' + outFile + '.tar.gz');
  }

  cb && cb();
}
