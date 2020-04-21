'use strict';

const Dialect = require('../dialect');

module.exports = class SQLiteDialect extends Dialect
{
  constructor()
  {
    super({ joinBracketsNotAllowed: true });
  }

  insertIgnore(table, record)
  {
    return `insert or ignore into ${table.insert(record)}`;
  }
}
