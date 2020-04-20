'use strict';

const mysql = require('./mysql');
if(mysql) {
  module.exports.mysql = new mysql;
}

const SQLiteDialect = require('./sqlite');
module.exports.sqlite = new SQLiteDialect;

const PostgreSQLDialect = require('./postgresql');
module.exports.postgres = new PostgreSQLDialect;

const Dialect = require('../dialect');
module.exports.default = new Dialect;
