'use strict';

const Dialect = require('../dialect');

module.exports = class SQLiteDialect extends Dialect
{
  insertIgnore(clause)
  {
    return `insert or ignore ${clause}`;
  }
}
