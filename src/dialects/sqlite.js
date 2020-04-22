'use strict';

const Dialect = require('../dialect');

module.exports = class SQLiteDialect extends Dialect
{
  constructor()
  {
    super({
      joinBracketsNotAllowed: true,
      singleTableUpdate: true,
      singleTableDelete: true
    });
  }

  insertIgnore(table, record)
  {
    const insert = table.insert(record);
    if(insert) {
      return `insert or ignore into ${insert}`;
    }
    return '';
  }
}
