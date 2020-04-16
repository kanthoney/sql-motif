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
    Verbatim: Verbatim,
    DateTime: DateTime,
    Fn: Fn,
    Identifier: Identifier,
    Operator: require('./src/operator'),
    operators: require('./src/operators')
  };
}
module.exports.Table = Table;
module.exports.Dialect = require('./src/dialect');
module.exports.dialects = require('./src/dialects');
module.exports.Verbatim = Verbatim;
module.exports.DateTime = DateTime;
module.exports.Fn = Fn;
module.exports.Identifier = Identifier;
module.exports.Operator = require('./src/operator');
module.exports.operators = require('./src/operators');
