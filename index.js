'use strict';

const Verbatim = require('./src/verbatim');
const DateTime = require('./src/datetime');
const Fn = require('./src/function');
const Identifier = require('./src/identifier');
const Table = require('./src/table');

module.exports = defaults => {
  return {
    Table: class extends Table {
      constructor(options) {
        super({ ...defaults, ...options });
      }
    },
    Dialect: require('./src/dialect'),
    dialects: require('./src/dialects'),
    verbatim: text => new Verbatim(text),
    datetime: dt => new DateTime(dt),
    fn: (name, ...args) => new Fn(name, ...args),
    identifier: name => new Identifier(name),
    Operator: require('./src/operator'),
    operators: require('./src/operators')
  };
}
module.exports.Table = Table;
module.exports.Dialect = require('./src/dialect');
module.exports.dialects = require('./src/dialects');
module.exports.verbatim = text => new Verbatim(text);
module.exports.datetime = dt => new DateTime(dt);
module.exports.fn = (name, ...args) => new Fn(name, ...args);
module.exports.identifier = name => new Identifier(name);
module.exports.Operator = require('./src/operator');
module.exports.operators = require('./src/operators');
