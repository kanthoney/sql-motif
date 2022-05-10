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
  constructor(name, value)
  {
    super(name, value);
    if(!_.isArray(this.value)) {
      this.value = [this.value];
    }
  }

  clause(dialect, lhs, table, context = {})
  {
    let value;
    if(this.value instanceof Function) {
      value = this.value({ col: lhs, sql: dialect.template(context), context });
    } else {
      value = this.value;
    }
    if(lhs) {
      return `${dialect.escape(lhs)} ${this.name} (${this.value.map(value => dialect.escape(value)).join(', ')})`;
    }
    return `${this.name} (${this.value.map(value => dialect.escape(value)).join(', ')})`;
  }
}

class BetweenOperator extends Operator
{
  constructor(name, value1, value2)
  {
    super(name, [value1, value2])
  }

  clause(dialect, lhs, table, context = {})
  {
    let value;
    if(this.value instanceof Function) {
      value = this.value({ col: lhs, sql: dialect.template(context), context });
    } else {
      value = this.value;
    }
    if(lhs) {
      return `${dialect.escape(lhs)} ${this.name} ${dialect.escape(this.value[0])} and ${dialect.escape(this.value[1])}`;
    }
    return `${this.name} ${dialect.escape(this.value[0])} and ${dialect.escape(this.value[1])}`;
  }
}

class OrOperator extends Operator
{
  constructor(name, values)
  {
    if(values instanceof Array) {
      super(name, values);
    } else {
      super(name, [values]);
    }
  }

  clause(dialect, lhs, table, context = {})
  {
    const sql = dialect.template(context);
    let clauses = this.value.reduce((acc, value) => {
      if(value instanceof Function) {
        value = value({ col: lhs, sql, table, context });
      }
      if(lhs) {
        if(!(value instanceof Operator)) {
          value = new EqualsOperator(value);
        }
        acc.push(value.clause(dialect, lhs, table, context));
      }
      return acc;
    }, []);
    if(clauses.length > 1) {
      return `(${clauses.join(' ' + this.name + ' ')})`;
    }
    return clauses[0];
  }
};

module.exports.eq = value => new EqualsOperator(value);
module.exports.ne = value => new NotEqualsOperator(value);
module.exports.lt = value => new Operator('<', value);
module.exports.gt = value => new Operator('>', value);
module.exports.le = value => new Operator('<=', value);
module.exports.ge = value => new Operator('>=', value);
module.exports.in = value => new InOperator('in', value);
module.exports.notIn = value => new InOperator('not in', value);
module.exports.between = (value1, value2) => new BetweenOperator('between', value1, value2);
module.exports.notBetween = (value1, value2) => new BetweenOperator('not between', value1, value2);
module.exports.regExp = value => new Operator('regexp', value);
module.exports.notRegExp = value => new Operator('not regexp', value);
module.exports.like = value => new Operator('like', value);
module.exports.notLike = value => new Operator('not like', value);
module.exports.startsWith = value => new Operator('regexp', `^${_.escapeRegExp(value)}`);
module.exports.endsWith = value => new Operator('regexp', `${_.escapeRegExp(value)}$`);
module.exports.contains = value => new Operator('regexp', `${_.escapeRegExp(value)}`);
module.exports.notStartsWith = value => new Operator('not regexp', `^${_.escapeRegExp(value)}`);
module.exports.notEndsWith = value => new Operator('not regexp', `${_.escapeRegExp(value)}$`);
module.exports.notContains = value => new Operator('not regexp', `${_.escapeRegExp(value)}`);
module.exports.or = value => new OrOperator('or', value);
