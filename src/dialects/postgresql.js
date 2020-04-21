'use strict';

const Dialect = require('../dialect');

module.exports = class PostgreSQLDialect extends Dialect
{

  escapeBuffer(s)
  {
    return `${this.options.quotes[0]}\\x${s.toString('hex')}${this.options.quotes[1]}`;
  }

  insertIgnore(table, record)
  {
    return `insert into ${table.insert(record)} on conflict do nothing`;
  }
}
