#! /usr/bin/env node
'use strict';

/* jshint node: true */

process.on('uncaughtException', fail);

var start   = +new Date();
var which   = process.argv[process.argv.length - 1];
var async   = require('async');
var moment  = require('moment');
var config  = require('../config');
var dropbox = require('../lib/dropbox-sync');
var tarball = require('../lib/tarball');
var clean   = require('../lib/clean');
var outFile = config.file[which].file_prefix + 'webroot-' + moment().format('YYYYMMDD-HHmmss');

async.series({
  connect: function (cb) {
    dropbox.connect({
      key: config.drivers.dropbox.key,
      secret: config.drivers.dropbox.secret
    });

    dropbox.setDirectory(config.file[which].directory);

    cb();
  },
  archive: tarball.create.bind(tarball, outFile, config.file[which].include),
  sync: dropbox.send.bind(dropbox, outFile),
  clean: clean.bind(clean, outFile)
}, function (err, args) {
  if (err) return fail(err);

  console.log('The file system backup has been completed successfully.\n');
  console.log('Directories backed up: %s\n', config.file[which].include.join(', '));
  console.log('Total execution time: %d seconds', ((+new Date() - start) / 1000).toFixed(2));
  console.log('\nThe backup file has been saved to your Dropbox: %s (%s)', args.sync.path, args.sync.humanSize);
  process.exit(0);
});

function fail (err) {
  clean && clean(outFile);

  console.error('The file system backup job has encountered a fatal error and could not continue.\n');
  console.error(err);

  process.exit(1);
}
