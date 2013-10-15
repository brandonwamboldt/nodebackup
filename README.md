Node Backup
===========

This project is designed to provide a cloud backup service for use on desktops or servers, built in Node.js.

**WARNING:** this isn't even alpha software, don't use it. Feel free to look around though.

Planned Features
----------------

* Support for multiple cloud storage backends
    * ~~Dropbox~~
    * Google Drive
    * AWS
* MySQL support
    * ~~Backups~~
    * Restore
* Filesystem support
    * ~~Backups~~
    * Restore
    * ~~Include multiple folders~~
* PostGreSQL support
    * Backups
    * Restore
* MongoDB support
    * Backups
    * Restore

Installation
------------

1. Run `npm install` to install package dependencies
2. Copy `config.json.example` to `config.json` and fill out the appropriate values (namely your cloud storage parameters)
3. Generate an oAuth token using `bin/oauth-auth`

Syntax Examples
---------------

```
/opt/nodebackup/bin/mysql-backup nightly
```

You can define multiple configurations for each supported system (filesystem, mysql, postgre, etc), and select which to run via the command line.
