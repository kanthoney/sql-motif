'use strict';

const _ = require('lodash');

class Fn
{
  constructor(name, ...args)
  {
    this.name = name;
    this.args = [...args];
  }

  clause(dialect)
  {
    return `${this.name}(${this.args.map(arg => dialect.escape(arg)).join(', ')})`;
  }
}

module.exports = Fn;
