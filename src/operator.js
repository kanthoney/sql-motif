'use strict';

const _ = require('lodash');
const Verbatim = require('./verbatim');

class Operator
{
  constructor(name, value)
  {
    this.name = name;
    this.value = value;
  }

  clause(dialect, lhs, table, context = {})
  {
    let value;
    if(this.value instanceof Function) {
      value = Verbatim(this.value({ table, col: lhs, sql: dialect.template(context), context }));
    } else {
      value = this.value;
    }
    if(this.name instanceof Function) {
      if(lhs) {
        return `${dialect.escape(lhs, context)} ${this.name(value)} ${dialect.escape(this.value, context)}`;
      }
      return `${this.name(value)} ${dialect.escape(this.value)}`;
    }
    if(lhs) {
      return `${dialect.escape(lhs, context)} ${this.name} ${dialect.escape(value, context)}`;
    }
    return `${this.name} ${dialect.escape(value, context)}`;
  }
};

module.exports = Operator;
