'use strict';

const Verbatim = require('./src/verbatim');
const DateTime = require('./src/datetime');
const Fn = require('./src/function');
const Identifier = require('./src/identifier');

module.exports = defaults => {
  module.exports.Table = require('./src/table')(defaults);
  module.exports.Dialect = require('./src/dialect');
  module.exports.dialects = require('./src/dialects');
  module.exports.verbatim = text => new Verbatim(text);
  module.exports.datetime = dt => new DateTime(dt);
  module.exports.fn = (name, ...args) => new Fn(name, ...args);
  module.exports.identifier = name => new Identifier(name);
  module.exports.Operator = require('./src/operator');
  module.exports.operators = require('./src/operators');
}
module.exports.Table = require('./src/table')();
module.exports.Dialect = require('./src/dialect');
module.exports.dialects = require('./src/dialects');
module.exports.verbatim = text => new Verbatim(text);
module.exports.datetime = dt => new DateTime(dt);
module.exports.fn = (name, ...args) => new Fn(name, ...args);
module.exports.identifier = name => new Identifier(name);
module.exports.Operator = require('./src/operator');
module.exports.operators = require('./src/operators');
