'use strict';

const _ = require('lodash');
const moment = require('moment');
const Verbatim = require('./verbatim');

class Dialect
{
  constructor(options)
  {
    this.options = options || {};
    if(!this.options.quotes) {
      this.options.quotes = "'";
    }
    if(!this.options.idQuotes) {
      this.options.idQuotes = '"';
    }
    if(!this.options.likeChars) {
      this.options.likeChars = '%_';
    }
    if(this.options.backslash) {
      if(!this.options.escapeChars) {
        this.options.escapeChars = `\\${this.options.quotes[0]}${this.options.idQuotes[0]}`;
        if(this.options.quotes.length > 1) {
          this.options.escapeChars += this.options.quotes[1];
        }
        if(this.options.idQuotes.length > 1) {
          this.options.escapeChars += this.options.idQuotes[1];
        }
      }
      this.escape_re = new RegExp(this.options.escapeChars.split('').map(char => char==='\\'?`\\\\(?![${this.options.likeChars}])`:_.escapeRegExp(char)).join('|'), 'g');
    } else {
      if(this.options.quotes.length === 1) {
        this.escape_re = new RegExp(_.escapeRegExp(this.options.quotes), 'g');
      } else {
        this.escape_re = new RegExp(`[${_.escapeRegExp(this.options.quotes)}]`, 'g');
      }
      if(this.options.idQuotes.length === 1) {
        this.id_escape_re = new RegExp(_.escapeRegExp(this.options.idQuotes), 'g');
      } else {
        this.id_escape_re = new RegExp(`[${_.escapeRegExp(this.options.idQuotes)}]`, 'g');
      }
    }
    if(this.options.quotes.length === 1) {
      this.options.quotes += this.options.quotes;
    }
    if(this.options.idQuotes.length === 1) {
      this.options.idQuotes += this.options.idQuotes;
    }
    this.like_escape_re = new RegExp(`[${_.escapeRegExp(this.options.likeChars)}]`, 'g');
  }

  escapeNoQuotes(s)
  {
    if(this.options.useBackslashEscape) {
      return `${s}`.replace(this.escape_re, c => `\\${c}`);
    }
    return `${s}`.replace(this.escape_re, c => `${c}${c}`);
  }

  escapeIdNoQuotes(s)
  {
    if(this.options.useBackslashEscape) {
      return `${s}`.replace(this.escape_re, c => `\\${c}`);
    }
    return `${s}`.replace(this.id_escape_re, c => `${c}${c}`);
  }

  quoteNoEscape(s)
  {
    return `${this.options.quotes[0]}${s}${this.options.quotes[1]}`;
  }

  formatDate(d)
  {
    return moment(d).format('YYYY-MM-DD');
  }

  formatDateTime(dt)
  {
    return moment(dt).format('YYYY-MM-DD HH:mm:ss');
  }

  escapeBuffer(s)
  {
    return `X${this.options.quotes[0]}${s.toString('hex')}${this.options.quotes[1]}`;
  }

  escape(s, context)
  {
    const DateTime = require('./datetime');
    const DateOnly = require('./dateonly');
    const Fn = require('./function');
    const Identifier = require('./identifier');
    const Column = require('./column');
    const ColumnSet = require('./column-set');
    const Table = require('./table');
    const Operator = require('./operator');
    if(s instanceof Array) {
      return s.map(item => this.escape(item)).join(', ');
    }
    if(_.isNil(s)) {
      return 'null';
    }
    if(typeof s === 'number') {
      return `${s}`;
    }
    if(s instanceof Verbatim) {
      return s.text;
    }
    if(global.Buffer && s instanceof global.Buffer) {
      return this.escapeBuffer(s);
    }
    if(s instanceof Date || moment.isMoment(s)) {
      return this.escape(this.formatDateTime(s));
    }
    if(s instanceof DateTime) {
      return this.escape(this.formatDateTime(s.value));
    }
    if(s instanceof DateOnly) {
      return this.escape(this.formatDate(s.value));
    }
    if(s instanceof Fn) {
      return s.clause(this);
    }
    if(s instanceof Identifier) {
      return this.escapeId(s.name);
    }
    if(s instanceof Column || s instanceof ColumnSet) {
      return s.SQL(false, context);
    }
    if(s instanceof Table) {
      return s.fullName();
    }
    if(s instanceof Operator) {
      return s.clause(this);
    }
    return this.libraryEscape(s);
  }

  libraryEscape(s)
  {
    return `${this.options.quotes[0]}${this.escapeNoQuotes(s)}${this.options.quotes[1]}`;
  }

  escapeId(s)
  {
    return `${this.options.idQuotes[0]}${this.escapeIdNoQuotes(s)}${this.options.idQuotes[1]}`;
  }

  escapeLike(s)
  {
    return `${s}`.replace(this.like_escape_re, c => `\\${c}`);
  }

  insertIgnore(table, record)
  {
    const insert = table.insert(record);
    if(insert) {
      return `insert ignore into ${insert}`;
    }
    return '';
  }

  alterTable(table, options)
  {
    return `alter table ${table.fullName()}`;
  }

  dropPrimaryKey(options)
  {
    return `drop primary key`;
  }

  DropPrimaryKey(options)
  {
    return `${this.alterTable(table, options)} ${this.dropPrimaryKey(options)}`;
  }

  addPrimaryKey(table, options)
  {
    let s = table.createPrimaryKey(options);
    if(s) {
      return `add ${s}`;
    }
    return this.dropPrimaryKey(options);
  }

  AddPrimaryKey(table, options)
  {
    return `${this.alterTable(table, options)} ${this.addPrimaryKey(table, options)}`;
  }

  addColumn(table, name, options)
  {
    const col = table.column(name);
    if(col) {
      let spec = table.createColumn(col);
      if(spec) {
        return `add column ${spec}`;
      }
    }
  }

  AddColumn(table, name, options)
  {
    let s = this.addColumn(table, name, options);
    if(s) {
      return `${this.alterTable(table, options)} ${s}`;
    }
  }
  
  dropColumn(table, name, options = {})
  {
    return `drop column ${this.escapeId(name)}`;
  }

  DropColumn(table, name, options)
  {
    return `${this.alterTable(table, options)} ${this.dropColumn(table, name, options)}`;
  }

  renameColumn(table, oldName, name, options)
  {
    const col = table.column(name);
    if(col) {
      return `rename column ${this.escapeId(oldName)} to ${col.sql.name}`;
    }
  }

  RenameColumn(table, oldName, name, options)
  {
    const s = this.renameColumn(table, oldName, name, options);
    if(s instanceof Array) {
      return s.map(s => `${this.alterTable(table, options)} ${s}`);
    } else if(s) {
      return `${this.alterTable(table, options)} ${s}`;
    }
  }

  changeColumn(table, col, options = {})
  {
    let q = [];
    if(col.calc) {
      return q;
    }
    if(options.oldName) {
      q.push(this.RenameColumn(table, col, options.oldName, options));
    }
    q.push(`alter ${col.sql.name} type ${table.columnDataType(col)}`);
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

  ChangeColumn(table, name, options = {})
  {
    const col = table.column(name);
    if(col) {
      const s = this.changeColumn(table, col, options);
      if(s instanceof Array) {
        return s.map(s => `${this.alterTable(table, options)} ${s}`);
      } else if(s) {
        return `${this.alterTable(table, options)} ${s}`;
      }
    }
  }

  rename(table, oldName, schema, options)
  {
    if(schema === undefined) {
      schema = table.config.schema;
    }
    const name = schema?`${this.escapeId(schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    return `${name} rename to ${table.name()}`;
  }

  Rename(table, oldName, schema, options)
  {
    let s = this.rename(table, oldName, schema, options);
    if(s) {
      return `${this.alterTable(table, options)} ${s}`;
    }
  }

  addIndex(table, index, options)
  {
    const s = table.createIndex(index, options);
    if(s) {
      return `add ${s}`;
    }
  }

  AddIndex(table, index, options)
  {
    let s = this.addIndex(table, index, options);
    if(s) {
      return `${this.alterTable(table, options)} ${s}`;
    }
  }

  dropIndex(table, name, options)
  {
    return `index ${this.escapeId(name)}`;
  }

  DropIndex(table, name, options)
  {
    return `${this.alterTable(table, options)} drop ${this.dropIndex(table, name, options)}`;
  }

  addReference(table, spec, options)
  {
    const s = this.createForeignKey(table, spec);
    if(s) {
      return `add ${s}`;
    }
  } 

  AddReference(table, spec, options)
  {
    const s = this.addReference(table, spec, options);
    if(s) {
      return `${this.alterTable(table, options)} ${s}`;
    }
  }

  createForeignKey(table, ref)
  {
    const Table= require('./table');
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
    const cols = ((ref.columns instanceof Array)?ref.columns:[ref.columns]).reduce((acc, cols) => {
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
    let s = 'foreign key';
    if(ref.name) {
      s += ` ${this.escapeId(ref.name)}`;
    }
    s += ` (${cols.map(col => col.left).join(', ')}) references ${tableName} (${cols.map(col => col.right).join(', ')})`;
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

  dropReference(table, name, options)
  {
    return `drop foreign key ${this.escapeId(name)}`;
  }

  DropReference(table, name, options)
  {
    let s = this.dropReference(table, name, options);
    if(s) {
      return `${this.alterTable(table, options)} ${s}`;
    }
  }

  template(context = {})
  {
    return (strings, ...args) => {
      let s = '';
      let i = 0;
      while(i < strings.length) {
        s += strings[i];
        if(i < args.length) {
          s += this.escape(args[i], context);
        }
        i++;
      }
      return new Verbatim(s);
    }
  }
}

module.exports = Dialect;
