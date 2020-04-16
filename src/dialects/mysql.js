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
  }

  module.exports = MySQLDialect;
} catch(error) {
  module.exports = null;
}
