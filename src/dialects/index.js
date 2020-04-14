'use strict';

const mysql = require('./mysql');
if(mysql) {
  module.exports.mysql = mysql;
}

module.exports.default = require('../dialect');
