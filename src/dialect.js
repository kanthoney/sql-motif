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
    this.template = (strings, ...args) => {
      let s = '';
      let i = 0;
      while(i < strings.length) {
        s += strings[i];
        if(i < args.length) {
          s += this.escape(args[i]);
        }
        i++;
      }
      return new Verbatim(s);
    }
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

  escape(s)
  {
    const DateTime = require('./datetime');
    const Fn = require('./function');
    const Identifier = require('./identifier');
    const Column = require('./column');
    const Table = require('./table');
    const Operator = require('./operator');
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
      return this.escape(this.formatDate(s));
    }
    if(s instanceof DateTime) {
      return this.escape(this.formatDateTime(s.value));
    }
    if(s instanceof Fn) {
      return s.clause(this);
    }
    if(s instanceof Identifier) {
      return this.escapeId(s.name);
    }
    if(s instanceof Column) {
      return s.SQL();
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
    return `insert ignore into ${table.insert(record)}`;
  }

}

module.exports = Dialect;
