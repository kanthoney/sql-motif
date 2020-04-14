'use strict';

const _ = require('lodash');

class Operator
{
  constructor(name, value)
  {
    if(_.isFunction(name)) {
      this.name = name(value);
    } else {
      this.name = name;
    }
    this.value = value;
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escape(this.value)}`;
  }
};

module.exports = Operator;
