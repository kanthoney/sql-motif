'use strict';

const _ = require('lodash');
const pg = require('pg');

module.exports = class DB
{
  constructor(config)
  {
    this.db = new pg.Pool(config || {});
  }

  async query(q)
  {
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
    return this.db.query(q).then(result => {
      return result.rows;
    }).catch(err => {
      console.error(q);
      return Promise.reject(err);
    });
  }
}
