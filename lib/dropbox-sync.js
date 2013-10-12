'use strict';

/* jshint node: true */

var Dropbox = require('dropbox');
var fs      = require('fs');
var client  = null;
var server  = null;
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
 * Set the name of the server, used to namespacing the backups.
 * @param {!string} prefix
 */
exports.setServerPrefix = function (prefix) {
  server = prefix;
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
  var remoteFile = '/' + server + '/' + folder + '/' + localFile + '.tar.gz';

  client.writeFile(remoteFile, fs.readFileSync('/tmp/' + localFile + '.tar.gz'), callback);
};
