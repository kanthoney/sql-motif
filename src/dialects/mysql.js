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

    alterTable(table, options = {})
    {
      if(options.ignore) {
        return `alter ignore table ${table.fullName()}`;
      }
      return `alter table ${table.fullName()}`;
    }
    
    renameColumn(table, oldName, name, options)
    {
      const col = table.column(name);
      if(col) {
        let s = table.createColumn(col);
        if(s) {
          return `change column ${this.escapeId(oldName)} ${s}`;
        }
      }
    }

    changeColumn(table, col, options = {})
    {
      if(col.calc) {
        return;
      }
      return `modify column ${table.createColumn(col)}`;
    }

    rename(table, oldName, options = {})
    {
      if(options.schema === undefined) {
        options.schema = table.config.schema;
      }
      const name = options.schema?`${this.escapeId(options.schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
      return `${name} rename to ${table.fullName()}`;
    }

    Rename(table, oldName, options = {})
    {
      let s = this.rename(table, oldName, options);
      if(s) {
        if(options.ignore) {
          return `alter ignore table ${s}`;
        } else {
          return `alter table ${s}`;
        }
      }
  }

  }

  module.exports = MySQLDialect;
} catch(error) {
  module.exports = null;
}
