'use strict';

const _ = require('lodash');

class Operator
{
  constructor(name, value)
  {
    this.name = name;
    this.value = value;
  }

  clause(dialect, rhs)
  {
    let value;
    if(this.value instanceof Function) {
      value = this.value(rhs, dialect.template);
    } else {
      value = this.value;
    }
    if(this.name instanceof Function) {
      if(rhs) {
        return `${dialect.escape(rhs)} ${this.name(value)} ${dialect.escape(this.value)}`;
      }
      return `${this.name(value)} ${dialect.escape(this.value)}`;
    }
    if(rhs) {
      return `${dialect.escape(rhs)} ${this.name} ${dialect.escape(value)}`;
    }
    return `${this.name} ${dialect.escape(value)}`;
  }
};

module.exports = Operator;
