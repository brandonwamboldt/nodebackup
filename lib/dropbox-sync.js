'use strict';

/* jshint node: true */

var Dropbox = require('dropbox');
var fs      = require('fs');
var os      = require('os');
var client  = null;
var folder  = null;

/**
 * Create a new Dropbox Client with the given credentials as well as the cached
 * oAuth token.
 * @param {!object] options
 * @return {Dropbox.Client}
 */
exports.connect = function (options) {
  options.token = fs.readFileSync(__dirname + '/../.oauth-token').toString('UTF-8').trim();
  client = new Dropbox.Client(options);

  return client;
};

/**
 * Set the name of the directory to store files in.
 * @param {!string} prefix
 */
exports.setDirectory = function (prefix) {
  folder = prefix;
};

/**
 * Transmit a file to Dropbox.
 * @param {!string} localFile
 * @param {!function(err, response)} callback
 */
exports.send = function (localFile, callback) {
  var remoteFile = '/' + os.hostname() + '/' + folder + '/' + localFile + '.tar.gz';

  client.writeFile(remoteFile, fs.readFileSync('/tmp/' + localFile + '.tar.gz'), callback);
};

/**
 * Remove old files that exceed the number of backups to keep.
 * @param {!integer} max
 * @param {!function(err, filesRemoved)} callback
 */
exports.cleanOld = function (max, callback) {
  var remoteDir = '/' + os.hostname() + '/' + folder;

  client.readdir(remoteDir, function (err, files) {
    // If we haven't hit the file limit, do nothing
    if (files.length < max || err) {
      callback(err, []);
    }

    // Sort by file name
    files = files.sort(function (a, b) { return a > b ? 1 : -1 });

    // How many do we need to remove?
    files = files.slice(0, files.length - max);

    // Keep track of our callbacks
    var asyncCounter = 0;

    // Remove them
    files.forEach(function (f) {
      client.unlink(remoteDir + '/' + f, function () {
        asyncCounter++;

        if (asyncCounter >= files.length) {
          callback(err, files);
        }
      });
    });
  });
};
