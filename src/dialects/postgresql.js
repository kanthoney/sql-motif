'use strict';

const Dialect = require('../dialect');

module.exports = class PostgreSQLDialect extends Dialect
{

  constructor()
  {
    super({
      joinBracketsNotAllowed: true,
      singleTableUpdate: true,
      singleTableDelete: true,
      noIndexesInCreate: true
    });
  }

  escapeBuffer(s)
  {
    return `${this.options.quotes[0]}\\x${s.toString('hex')}${this.options.quotes[1]}`;
  }

  insertIgnore(table, record)
  {
    const insert = table.insert(record);
    if(insert) {
      return `insert into ${insert} on conflict do nothing`;
    }
    return '';
  }
}
