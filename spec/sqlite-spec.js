'use strict';

const DB = require('./sqlite/db');
const dialects = require('../src/dialects');
describe("sqlite tests", () => {
  require('./db')('sqlite', dialects.sqlite, new DB);
});
