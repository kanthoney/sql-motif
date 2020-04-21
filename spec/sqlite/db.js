'use strict';

const sqlite = require('sqlite3');

module.exports = class DB
{
  constructor()
  {
    this.db = new Promise((resolve, reject) => {
      const db = new sqlite.Database(':memory:', err => {
        if(err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  async query(q)
  {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      db.all(q, (err, result) => {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}
