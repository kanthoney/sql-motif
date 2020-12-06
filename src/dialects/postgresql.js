'use strict';

const Dialect = require('../dialect');
const _ = require('lodash');

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
  
  alterTable(table, options = {})
  {
    if(options.ignore) {
      return `alter table if exists ${table.fullName()}`;
    }
    return `alter table ${table.fullName()}`;
  }

  changeColumn(table, col, options = {})
  {
    let q = [];
    if(col.calc) {
      return q;
    }
    if(options.oldName) {
      let s = this.RenameColumn(table, col, options.oldName);
      if(s) {
        q.push(s);
      }
    }
    let s = `alter ${col.sql.name} type ${table.columnDataType(col)}`;
    if(s) {
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
      if(s) {
        q.push(s)
      }
      name = table.config.schema?`${this.escapeId(table.config.schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    }
    let s = `${name} rename to ${table.name()}`;
    if(s) {
      q.push(s);
    }
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

  Rename(table, oldName, options = {})
  {
    let s = this.rename(table, oldName, options);
    let at = options.ignore?'alter table if exists':'alter table';
    if(s) {
      if(s instanceof Array) {
        return s.map(s => `${at} ${s}`);
      }
      return `${at} ${s}`;
    }
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

  createForeignKey(table, ref)
  {
    const Table = require('../table');
    if(!ref.table || !ref.columns) {
      return null;
    }
    let tableName;
    if(ref.table instanceof Table) {
      tableName = ref.table.fullName();
    } else {
      if(_.isString(ref.table)) {
        tableName = this.escapeId(ref.table);
      } else if(table.name === undefined) {
        return null;
      } else if(table.schema) {
        tableName = `${this.escapeId(table.schema)}.${this.escapeId(table.name)}`;
      } else {
        tableName = this.escapeId(table.name);
      }
    }
    const cols = ref.columns.reduce((acc, cols) => {
      if(_.isString(cols)) {
        const m = /([^:]+):([^:]+)/.exec(cols);
        if(m) {
          cols = [m[1], m[2]];
        } else {
          cols = [cols, cols];
        }
      } else if(cols.length === 1) {
        cols = [cols[0], cols[0]];
      }
      let leftCol, rightCol;
      leftCol = table.columns.fieldFromName(cols[0]);
      if(!leftCol) {
        return acc;
      }
      leftCol = leftCol.sql.name;
      if(ref.table instanceof Table) {
        rightCol = ref.table.columns.fieldFromName(cols[1]);
        if(!rightCol) {
          return acc;
        }
        rightCol = rightCol.sql.name;
      } else {
        rightCol = this.escapeId(cols[1]);
      }
      return acc.concat({ left: leftCol, right: rightCol });
    }, []);
    if(cols.length === 0) {
      return null;
    }
    let s = '';
    if(ref.name) {
      s += `constraint ${this.escapeId(ref.name)}`;
    }
    s += ` foreign key (${cols.map(col => col.left).join(', ')}) references ${tableName} (${cols.map(col => col.right).join(', ')})`;
    if(ref.onUpdate) {
      s += ` on update ${ref.onUpdate}`;
    }
    if(ref.onDelete) {
      s += ` on delete ${ref.onDelete}`;
    }
    if(ref.match) {
      s += ` match ${ref.match}`;
    }
    return s;
  }

  dropReference(table, name, options = {})
  {
    return 'drop constraint ' + (options.ignore?'if exists ':'') + this.escapeId(name);
  }

  limit(...args)
  {
    if(args[1] === undefined) {
      if(args[0] === undefined) {
        return '';
      }
      return this.escape(parseInt(args[0]));
    }
    return `${this.escape(parseInt(args[1]))} offset ${this.escape(parseInt(args[0]))}`;
  }
  
}
