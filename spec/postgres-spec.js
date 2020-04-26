'use strict';

try {
  const DB = require('./postgres/db');
  const dialects = require('../src/dialects');

  const config = require('./dev/pg.json');
  const db = new DB(config);
  describe("Postgres tests", () => {
    require('./db')('postgres', dialects.postgres, db);
  });
} catch(error) {
  console.error("No Postgres config - not running postgres tests");
}
