'use strict';

const Verbatim = require('./src/verbatim');
const DateOnly = require('./src/dateonly');
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
    DateTime: DateOnly,
    Fn: Fn,
    Identifier: Identifier,
    Operator: require('./src/operator'),
    operators: require('./src/operators'),
    Record: require('./src/record'),
    RecordSet: require('./src/recordset')
  };
}
module.exports.Table = Table;
module.exports.Dialect = require('./src/dialect');
module.exports.dialects = require('./src/dialects');
module.exports.Verbatim = Verbatim;
module.exports.DateOnly = DateOnly;
module.exports.Fn = Fn;
module.exports.Identifier = Identifier;
module.exports.Operator = require('./src/operator');
module.exports.operators = require('./src/operators');
module.exports.Record = require('./src/record');
module.exports.RecordSet = require('./src/recordset');
