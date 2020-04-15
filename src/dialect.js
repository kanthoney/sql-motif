'use strict';

const _ = require('lodash');
const moment = require('moment');
const Verbatim = require('./verbatim');

class Dialect
{
  constructor(options)
  {
    this.options = options || {};
    if(this.options.quotes) {
      if(this.options.quotes.length === 1) {
        this.options.quotes = `${this.options.quotes}${this.options.quotes}`;
      }
    } else {
      this.options.quotes = "''";
    }
    if(this.options.idQuotes) {
      if(this.options.idQuotes.length === 1) {
        this.options.idQuotes = `${this.options.idQuotes}${this.options.idQuotes}`;
      }
    } else {
      this.options.idQuotes = '""';
    }
    if(!this.options.escapeChars) {
      this.options.escapeChars = `\\${this.options.quotes[0]}${this.options.idQuotes[0]}`;
      if(this.options.quotes[1] !== this.options.quotes[0]) {
        this.options.escapeChars += this.options.quotes[1];
      }
      if(this.options.idQuotes[1] !== this.options.idQuotes[0]) {
        this.options.escapeChars += this.options.idQuotes[1];
      }
    }
    if(!this.options.likeEscapeChars) {
      this.options.likeEscapeChars = '%_';
    }
    this.escape_re = new RegExp(this.options.escapeChars.split('').map(char => char==='\\'?`\\\\(?![${this.options.likeEscapeChars}])`:_.escapeRegExp(char)).join('|'), 'g');
    this.like_escape_re = new RegExp(`[${_.escapeRegExp(this.options.likeEscapeChars)}]`, 'g');
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
    return `${s}`.replace(this.escape_re, c => `\\${c}`);
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

  _escape(s, f)
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
      return `X${this.escape(s.toString('hex'))}`;
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
      return this.escapeId(s);
    }
    if(s instanceof Column) {
      return s.sql.fullName;
    }
    if(s instanceof Table) {
      return s.fullName();
    }
    if(s instanceof Operator) {
      return s.clause(this);
    }
    return f(s);
  }

  defaultEscape(s)
  {
    return `${this.options.quotes[0]}${this.escapeNoQuotes(s)}${this.options.quotes[1]}`;
  }

  escape(s)
  {
    return this._escape(s, this.defaultEscape.bind(this));
  }

  escapeId(s)
  {
    return `${this.options.idQuotes[0]}${this.escapeNoQuotes(s)}${this.options.idQuotes[1]}`;
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
