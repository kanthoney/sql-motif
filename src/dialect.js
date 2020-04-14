'use strict';

const _ = require('lodash');
const moment = require('moment');
const Verbatim = require('./verbatim');
const DateTime = require('./datetime');
const Fn = require('./function');
const Identifier = require('./identifier');

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
      this.options.likeEscapeChars === '%_';
    }
  }

  escapeNoQuotes(s)
  {
    return `${s}`.replace(new RegExp(`[${_.escapeRegExp(this.options.escapeChars)}]`, 'g'), c => `\\${c}`);
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

  _escape(s)
  {
    if(_.isNil(s)) {
      return 'null';
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
    throw new Error('');
  }

  escape(s)
  {
    try {
      return this._escape(s);
    } catch(error) {
      return `${this.options.quotes[0]}${this.escapeNoQuotes(s)}${this.options.quotes[1]}`;
    }
  }

  escapeId(s)
  {
    return `${this.options.idQuotes[0]}${this.escapeNoQuotes(s)}${this.options.idQuotes[1]}`;
  }

  escapeLikeNoQuotes(s)
  {
    return s.replace(new RegExp(_.escapeRegExp(`[${this.options.likeEscapeChars}${this.options.escapeChars}]`), 'g'), c => `\\${c}`);
  }

  escapeLike(s)
  {
    return this.quoteNoEscape(this.escapeLikeNoQuotes(s));
  }

  escapeStartsWith(s)
  {
    return this.quoteNoEscape(`${this.escapeLikeNoQuotes(s)}%`);
  }

  escapeEndsWith(s)
  {
    return this.quoteNoEscape(`%${this.escapeLikeNoQuotes(s)}`);
  }

  escapeContains(s)
  {
    return this.quoteNoEscape(`%${this.escapeLikeNoQuotes(s)}%`);
  }

}

module.exports = Dialect;
