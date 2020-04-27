'use strict';

const Dialect = require('../dialect');

module.exports = class SQLiteDialect extends Dialect
{
  constructor()
  {
    super({
      singleTableUpdate: true,
      singleTableDelete: true,
      noIndexesInCreate: true,
      insertDefault: 'null'
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
