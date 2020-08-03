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

  dropPrimaryKey(options)
  {
    return `${this.fullName()} drop primary key`;
  }

  DropPrimaryKey(options)
  {
    return `alter table ${this.dropPrimaryKey(options)}`;
  }

  addPrimaryKey(options)
  {
    let s = this.createPrimaryKey(options);
    if(s) {
      return `${this.fullName()} add ${s}`;
    }
    return this.dropPrimaryKey(options);
  }

  AddPrimaryKey()
  {
    return `alter table ${this.addPrimaryKey()}`;
  }

  addColumn(table, col, options)
  {
    let spec = table.createColumn(col);
    if(spec) {
      return `${table.fullName()} add column ${spec}`;
    }
  }

  dropColumn(table, name, options = {})
  {
    return `${table.fullName()} drop column ${this.escapeId(name)}`;
  }

  DropColumn(table, name, options)
  {
    return `alter table ${this.dropColumn(table, name, options)}`;
  }

  renameColumn(table, col, oldName, options)
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
      q.push(this.RenameColumn(table, col, options.oldName, options));
    }
    q.push(`${table.fullName()} alter ${col.sql.name} type ${table.columnDataType(col)}`);
    if(q.length === 1) {
      return q[0];
    }
    return q;
  }

  rename(table, oldName, schema, options)
  {
    if(schema === undefined) {
      schema = table.config.schema;
    }
    const name = schema?`${this.escapeId(schema)}.${this.escapeId(oldName)}`:this.escapeId(oldName);
    return `${name} rename to ${table.name()}`;
  }

  addIndex(table, index, options)
  {
    const s = table.createIndex(index, options);
    if(s) {
      return `${table.fullName()} add ${s}`;
    }
  }

  AddIndex(table, index, options)
  {
    return `alter table ${this.addIndex(table, index, options)}`;
  }

  dropIndex(table, name, options)
  {
    return `index ${this.escapeId(name)}`;
  }

  DropIndex(table, name, options)
  {
    return `drop ${this.dropIndex(table, name, options)}`;
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
