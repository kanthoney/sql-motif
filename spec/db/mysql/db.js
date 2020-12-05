'use strict';

const mysql = require('mysql');
const _ = require('lodash');

module.exports = class DB
{
  constructor(config)
  {
    this.pool = mysql.createPool(config);
  }

  async query(q)
  {
    const db = await this.db;
    if(q instanceof Array) {
      const it = q[Symbol.iterator]();
      const next = acc => {
        const n = it.next();
        if(n.done) {
          return acc;
        }
        return this.query(n.value).then(results => {
          return next(acc.concat(results));
        });
      }
      return next([]);
    }
    return new Promise((resolve, reject) => {
      const db = this.pool.getConnection((err, db) => {
        if(err) {
          reject(err);
        } else {
          db.query(q, (err, result) => {
            db.release();
            if(err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        }
      });
    }).catch(err => {
      console.log(q);
      return Promise.reject(err);
    });
  }
}
