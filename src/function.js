'use strict';

const Fn = function(name, ...args)
{
  if(!new.target) {
    return new Fn(name, ...args);
  }
  this.name = name;
  this.args = [...args];
  return this;
}

Fn.prototype.clause = function(dialect)
{
  return `${this.name}(${this.args.map(arg => dialect.escape(arg)).join(', ')})`;
}

module.exports = Fn;
