'use strict';

/* jshint node: true */

var fs            = require('fs');
var mysql         = require('mysql');
var async         = require('async');
var child_process = require('child_process');
var config        = require('../config');
var connection    = null;

/**
 * Create a new MySQL connection.
 * @param {!object} options
 * @return {mysql.connection}
 */
exports.connect = function (options) {
  connection = mysql.createConnection(options);

  return connection;
};

/**
 * Generate an SQL backup.
 * @param {!string} pathname
 * @param {!callable} done
 */
exports.backup = function (pathname, done) {
  if (!connection) return;

  pathname = '/tmp/' + pathname;

  // Create the working directory
  try {
    fs.mkdirSync(pathname);
  } catch (err) {
    done(err, null);
  }

  var stats = { tables: 0, databases : 0 };

  var q = async.queue(function (task, callback) {
    switch (task.action) {
      case 'show_databases':
        showDatabases(pathname, q, stats, callback);
        break;

      case 'create_database':
        showCreateDatabase(pathname, q, task, callback);
        break;

      case 'show_tables':
        showTablesInDatabase(q, task, stats, callback);
        break;

      case 'create_table':
        dumpTable(pathname, q, task, callback);
        break;
    }
  }, 6);

  // When the queue is finished processing, call our callback
  q.drain = function (err) {
    q.tasks = [];
    done(err, stats);
  };

  // Start by getting all of the databases
  q.push({ action: 'show_databases' });
};

/**
 * Restore a SQL backup. Not implemented.
 * @param {!string} pathname
 * @param {!callable} done
 */
exports.restore = function (pathname, callback) {
  if (!connection) return;

  callback(pathname);
};

/**
 * Get a list of databases for the current server.
 * @param {!string} workingDir
 * @param {!async.queue} q
 * @param {!object} stats
 * @param {!function} callback
 */
var showDatabases = function (workingDir, q, stats, callback) {
  connection.query('SHOW DATABASES', function (err, databases) {
    if (err) {
      return q.drain(err);
    }

    stats.databases += databases.length;

    databases.forEach(function (database) {
      fs.mkdirSync(workingDir + '/' + database.Database);

      q.push({ action: 'create_database', database: database.Database });
      q.push({ action: 'show_tables', database: database.Database });
    });

    callback();
  });
};

/**
 * Get the SQL needed to create the current database.
 * @param {!string} workingDir
 * @param {!async.queue} q
 * @param {!object} task
 * @param {!function} callback
 */
var showCreateDatabase = function (workingDir, q, task, callback) {
  connection.query('SHOW CREATE DATABASE `' + task.database + '`', function (err, sql) {
    if (err) {
      return q.drain(err);
    }

    fs.writeFileSync(workingDir + '/create_' + task.database + '.sql', sql[0]['Create Database']);
    callback();
  });
};

/**
 * Get a list of tables in the current database.
 * @param {!async.queue} q
 * @param {!object} task
 * @param {!object} stats
 * @param {!function} callback
 */
var showTablesInDatabase = function (q, task, stats, callback) {
  connection.query('SHOW TABLES FROM `' + task.database + '`', function (err, tables) {
    if (err) {
      return q.drain(err);
    }

    stats.tables += tables.length;

    tables.forEach(function (table) {
      q.push({
        action: 'create_table',
        database: task.database,
        table: table['Tables_in_' + task.database]
      });
    });

    callback();
  });
};

/**
 * Get the SQL dump for the current table.
 * @param {!string} workingDir
 * @param {!async.queue} q
 * @param {!object} task
 * @param {!function} callback
 */
var dumpTable = function (workingDir, q, task, callback) {
  var command = 'mysqldump' +
    ' --comments=FALSE' +
    ' -u' + config.mysql[0].username +
    (config.mysql[0].password ? ' -p' + config.mysql[0].password : '') +
    ' ' + task.database +
    ' ' + task.table +
    ' > "' + workingDir + '/' + task.database + '/' + task.table + '.sql"';

  child_process.exec(command, function () {
    callback();
  });
};
