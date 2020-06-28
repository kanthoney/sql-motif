'use strict';

const _ = require('lodash');

class Operator
{
  constructor(name, value)
  {
    this.name = name;
    this.value = value;
  }

  clause(dialect, rhs, context = {})
  {
    let value;
    if(this.value instanceof Function) {
      value = this.value({ col: rhs, sql: dialect.template(context), context });
    } else {
      value = this.value;
    }
    if(this.name instanceof Function) {
      if(rhs) {
        return `${dialect.escape(rhs, context)} ${this.name(value)} ${dialect.escape(this.value, context)}`;
      }
      return `${this.name(value)} ${dialect.escape(this.value)}`;
    }
    if(rhs) {
      return `${dialect.escape(rhs, context)} ${this.name} ${dialect.escape(value, context)}`;
    }
    return `${this.name} ${dialect.escape(value, context)}`;
  }
};

module.exports = Operator;
