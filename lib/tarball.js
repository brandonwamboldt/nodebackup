'use strict';

/* jshint node: true */

var cp   = require('child_process');
var path = require('path');

/**
 * Create a gzipped tarball from a given folder.
 * @param {!string} outFile
 * @param {array} source
 * @param {!function(error, outputFile)} callback
 */
exports.create = function (outFile, source, callback) {
  if (typeof source === 'function') {
    callback = source;
    source = false;
  }

  if (source) {
    var cmd = 'tar --ignore-failed-read -zcf /tmp/' + outFile + '.tar.gz ' + source.join(' ');
  } else {
    var cmd = 'tar --ignore-failed-read -zcf /tmp/' + outFile + '.tar.gz -C /tmp ' + outFile + '/';
  }

  cp.exec(cmd, function (err) {
    if (!err.killed) {
      err = null;
    }

    callback(err);
  });
};
