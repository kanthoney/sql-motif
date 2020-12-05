'use strict';

const sqlite = require('sqlite3');
const _ = require('lodash');

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
    if(q instanceof Array) {
      const chunks = _.chunk(q, 10);
      const it = chunks[Symbol.iterator]();
      const next = acc => {
        const n = it.next();
        if(n.done) {
          return acc;
        }
        return Promise.all(n.value.map(q => this.query(q))).then(results => {
          return next(acc.concat(results));
        });
      }
      return next([]);
    }
    return new Promise((resolve, reject) => {
      db.all(q, (err, result) => {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }).catch(err => {
      console.log(q);
      return Promise.reject(err);
    });
  }
}
