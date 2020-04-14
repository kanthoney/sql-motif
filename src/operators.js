'use strict';

const Operator = require('./operator');
const _ = require('lodash');

class EqualsOperator extends Operator
{
  constructor(value)
  {
    super(val => _.isNil(value)?'is':'=', value);
  }
};

class NotEqualsOperator extends Operator
{
  constructor(value)
  {
    super(val => _.isNil(value)?'is not':'!=', value);
  }
};

class InOperator extends Operator
{
  constructor(value)
  {
    super('in', value);
    if(!_.isArray(this.value)) {
      this.value = [this.value];
    }
  }

  clause(dialect)
  {
    return `${this.name} (${this.value.map(value => dialect.escape(value)).join(', ')})`;
  }
}

class NotInOperator extends Operator
{
  constructor(value)
  {
    super('not in', value);
    if(!_.isArray(this.value)) {
      this.value = [this.value];
    }
  }

  clause(dialect)
  {
    return `${this.name} (${this.value.map(value => dialect.escape(value)).join(', ')})`;
  }
}

class StartsWithOperator extends Operator
{
  constructor(value)
  {
    super('like', value);
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escapeStartsWith(this.value)}`;
  }
}

class ContainsOperator extends Operator
{
  constructor(value)
  {
    super('like', value);
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escapeContains(this.value)}`;
  }
}

class EndsWithOperator extends Operator
{
  constructor(value)
  {
    super('like', value);
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escapeEndsWith(this.value)}`;
  }
}

class NotStartsWithOperator extends Operator
{
  constructor(value)
  {
    super('not like', value);
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escapeStartsWith(this.value)}`;
  }
}

class NotContainsOperator extends Operator
{
  constructor(value)
  {
    super('not like', value);
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escapeContains(this.value)}`;
  }
}

class NotEndsWithOperator extends Operator
{
  constructor(value)
  {
    super('not like', value);
  }

  clause(dialect)
  {
    return `${this.name} ${dialect.escapeEndsWith(this.value)}`;
  }
}

module.exports.eq = value => new EqualsOperator(value);
module.exports.ne = value => new NotEqualsOperator(value);
module.exports.lt = value => new Operator('<', value);
module.exports.gt = value => new Operator('>', value);
module.exports.le = value => new Operator('<=', value);
module.exports.ge = value => new Operator('>=', value);
module.exports.in = value => new InOperator(value);
module.exports.notIn = value => new NotInOperator(value);
module.exports.regExp = value => new Operator('regexp', value);
module.exports.notRegExp = value => new Operator('not regexp', value);
module.exports.startsWith = value => new StartsWithOperator(value);
module.exports.endsWith = value => new EndsWithOperator(value);
module.exports.contains = value => new ContainsOperator(value);
module.exports.notStartsWith = value => new NotStartsWithOperator(value);
module.exports.notEndsWith = value => new NotEndsWithOperator(value);
module.exports.notContains = value => new NotContainsOperator(value);
