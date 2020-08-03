'use strict';

try {
  const mysql = require('mysql');
  const Dialect = require('../dialect');
  const _ = require('lodash');

  class MySQLDialect extends Dialect
  {
    constructor()
    {
      super({
        quotes: mysql.escape(''),
        idQuotes: mysql.escapeId(''),
        likeEscapeChars: '%_'
      });
    }

    libraryEscape(s) {
      return mysql.escape(s);
    }

    quoteNoEscape(s) {
      return `${this.config.quotes[0]}${s}${this.config.quotes[1]}`;
    }

    escapeNoQuotes(s) {
      s = this.escape(s);
      return s.slice(1, s.length-2);
    }

    escapeId(s)
    {
      return mysql.escapeId(s);
    }

    escapeLike(s)
    {
      return this.escape(s).replace(new RegExp(`[${_.escapeRegExp(this.options.likeEscapeChars)}]`, 'g'), c => `\\${c}`);
    }

    escapeLikeNoQuotes(s)
    {
      s = this.escapeLike(s);
      return s.slice(1, s.length - 2);
    }

    addColumn(table, col)
    {
      const spec = table.createColumn(col);
      if(spec) {
        return `${table.fullName()} add column ${spec}`;
      }
    }

    renameColumn(table, col, oldName)
    {
      return `${table.fullName()} change column ${this.escapeId(oldName)} ${table.createColumn(col)}`;
    }

    changeColumn(table, col, options = {})
    {
      return this.renameColumn(table, col, options.oldName || col.name);
    }

    rename(table, oldName, schema)
    {
      if(schema === undefined) {
        schema = table.config.schema;
      }
      const name = schema?`${this.escapeId(schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
      return `${name} rename to ${table.fullName()}`;
    }
  }

  module.exports = MySQLDialect;
} catch(error) {
  module.exports = null;
}
