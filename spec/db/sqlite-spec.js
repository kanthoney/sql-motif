'use strict';

try {
  const DB = require('./sqlite/db');
  const dialects = require('../../src/dialects');
  describe("sqlite tests", () => {
    require('./db')('sqlite', dialects.sqlite, new DB);
  });
} catch(error) {
  console.error("No SQLLite config - not running SQLLite tests");
}
