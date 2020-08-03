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

  addColumn(table, col)
  {
    const spec = table.createColumn(col);
    if(spec) {
      return `${table.fullName()} add column ${spec}`;
    }
  }

  renameColumn(table, col, oldName)
  {
    return `${table.fullName()} rename column ${this.escapeId(oldName)} to ${col.sql.name}`;
  }

  changeColumn(table, col, options)
  {
    let q = [];
    if(col.calc) {
      return q;
    }
    if(options.oldName) {
      q.push(this.RenameColumn(table, col, options.oldName));
    }
    q.push(`${table.fullName()} alter ${col.sql.name} type ${table.columnDataType(col)}`);
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

  rename(table, oldName, schema)
  {
    let q = [];
    if(schema === undefined) {
      schema = table.config.schema;
    }
    let name = schema?`${this.escapeId(schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    if(schema !== table.config.schema) {
      q.push(`${name} set schema ${this.escapeId(table.config.schema)}`);
      name = table.config.schema?`${this.escapeId(table.config.schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    }
    q.push(`${name} rename to ${table.name()}`);
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

}
