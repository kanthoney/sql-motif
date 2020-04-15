'use strict';

const _ = require('lodash');

class Operator
{
  constructor(name, value)
  {
    this.name = name;
    this.value = value;
  }

  clause(dialect, col)
  {
    let value;
    if(this.value instanceof Function) {
      value = this.value(col, dialect.template);
    } else {
      value = this.value;
    }
    if(this.name instanceof Function) {
      return `${this.name(value)} ${dialect.escape(this.value)}`;
    }
    return `${this.name} ${dialect.escape(value)}`;
  }
};

module.exports = Operator;
