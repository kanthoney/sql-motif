'use strict';

try {
  const DB = require('./mysql/db');
  const dialects = require('../src/dialects');

  const config = require('./dev/mysql.json');
  const db = new DB(config);
  describe("MySQL tests", () => {
    require('./db')('MySQL', dialects.mysql, db);
  });
} catch(error) {
  console.error("No MySQL config - not running MySQL tests");
}
