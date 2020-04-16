'use strict';

const mysql = require('./mysql');
if(mysql) {
  module.exports.mysql = new mysql;
}

const Dialect = require('../dialect');
module.exports.default = new Dialect;
