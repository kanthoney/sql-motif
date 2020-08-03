'use strict';

const Dialect = require('../dialect');

module.exports = class PostgreSQLDialect extends Dialect
{

  constructor()
  {
    super({
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

  addPrimaryKey(options = {})
  {
    let s = super.addPrimaryKey(options);
    if(options.ignore) {
      return `if exists ${s}`;
    }
    return s;
  }

  dropPrimaryKey(options = {})
  {
    let s = super.dropPrimaryKey(options);
    if(options.ignore) {
      return `if exists ${s}`;
    }
    return s;
  }

  addColumn(table, col, options = {})
  {
    const spec = table.createColumn(col);
    if(spec) {
      let s = `${table.fullName()} add column ${spec}`;
      if(options.ignore) {
        return `if exists ${s}`;
      }
      return s;
    }
  }

  dropColumn(table, name, options = {})
  {
    let s = super.dropColumn(table, name, options);
    if(options.ignore) {
      return `if exists ${s}`;
    }
    return s;
  }

  renameColumn(table, col, oldName, options = {})
  {
    let s = `${table.fullName()} rename column ${this.escapeId(oldName)} to ${col.sql.name}`;
    if(options.ignore) {
      return `if exists ${s}`;
    }
    return s;
  }

  changeColumn(table, col, options = {})
  {
    let q = [];
    if(col.calc) {
      return q;
    }
    if(options.oldName) {
      let s = this.RenameColumn(table, col, options.oldName);
      if(options.ignore) {
        q.push(`if exists ${s}`);
      } else {
        q.push(s);
      }
    }
    let s = `${table.fullName()} alter ${col.sql.name} type ${table.columnDataType(col)}`;
    if(options.ignore) {
      q.push(`if exists ${s}`);
    } else {
      q.push(s);
    }
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

  rename(table, oldName, options = {})
  {
    let q = [];
    if(options.schema === undefined) {
      options.schema = table.config.schema;
    }
    let name = options.schema?`${this.escapeId(options.schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    if(options.schema !== table.config.schema) {
      let s = `${name} set schema ${this.escapeId(table.config.schema)}`;
      if(options.ignore) {
        q.push(`if exists ${s}`);
      } else {
        q.push(s)
      }
      name = table.config.schema?`${this.escapeId(table.config.schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    }
    let s = `${name} rename to ${table.name()}`;
    if(options.ignore) {
      q.push(`if exists ${s}`);
    } else {
      q.push(s);
    }
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

  addIndex(table, index, options = {})
  {
    let s = 'index';
    if(index.unique) {
      s = 'unique ' + s;
    }
    if(options.ignore) {
      s += ' if not exists';
    }
    if(index.name) {
      s += ` ${this.escapeId(index.name)}`;
    }
    s += ` on ${table.fullName()}`;
    let cols = index.columns.reduce((acc, name) => {
      const col = table.column(name);
      if(col) {
        return acc.concat(col.sql.name);
      }
      return acc;
    }, []);
    if(cols.length === 0) {
      return null;
    }
    s += `(${cols.join(', ')})`;
    return s;
  }

  AddIndex(table, index, options)
  {
    return `create ${this.addIndex(table, index, options)}`;
  }

  dropIndex(table, index, options = {})
  {
    if(options.ignore) {
      return `index if exists ${this.escapeId(index)}`;
    }
    return `index ${this.escapeId(index)}`;
  }

  DropIndex(table, index, options)
  {
    return `drop ${this.dropIndex(table, index, options)}`;
  }

}
