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

    addPrimaryKey(options = {})
    {
      let s = super.addPrimaryKey(options);
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    dropPrimaryKey(options = {})
    {
      let s = super.dropPrimaryKey(options);
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    addColumn(table, col, options = {})
    {
      const spec = table.createColumn(col);
      if(spec) {
        const s = `${table.fullName()} add column ${spec}`;
        if(options.ignore) {
          return `ignore ${s}`;
        }
        return s;
      }
    }

    renameColumn(table, col, oldName, options = {})
    {
      const s = `${table.fullName()} change column ${this.escapeId(oldName)} ${table.createColumn(col)}`;
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    changeColumn(table, col, options = {})
    {
      const s = `${table.fullName()} modify column ${table.createColumn(col)}`;
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    rename(table, oldName, options = {})
    {
      if(options.schema === undefined) {
        options.schema = table.config.schema;
      }
      const name = options.schema?`${this.escapeId(options.schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
      const s = `${name} rename to ${table.fullName()}`;
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    dropColumn(table, name, options = {})
    {
      let s = super.dropColumn(table, name, options);
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    AddIndex(table, index, options = {})
    {
      if(options.ignore) {
        return `alter table ignore ${this.addIndex(table, index, options)}`;
      }
      return `alter table ${this.addIndex(table, index, options)}`;
    }

    dropIndex(table, index, options = {})
    {
      const s = `${table.fullName()} drop index ${this.escapeId(index)}`;
      if(options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    DropIndex(table, index, options)
    {
      return `alter table ${this.dropIndex(table, index, options)}`;
    }

    addReference(table, spec, options = {})
    {
      let s = super.addReference(table, spec, options);
      if(s && options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

    dropReference(table, name, options = {})
    {
      let s = super.dropReference(table, name, options);
      if(s && options.ignore) {
        return `ignore ${s}`;
      }
      return s;
    }

  }

  module.exports = MySQLDialect;
} catch(error) {
  module.exports = null;
}
