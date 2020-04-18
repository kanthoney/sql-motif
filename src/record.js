'use strict';

const _ = require('lodash');

class Record
{
  constructor(recordSet, data)
  {
    this.recordSet = recordSet;
    this.data = data;
  }

  hashKey()
  {
    if(this.hash === undefined) {
      const hash = this.recordSet.table.columns.fields().reduce((acc, col) => {
        const path = col.path;
        if(col.primaryKey || _.has(this.recordSet.joined, path)) {
          let value = _.get(this.data, path);
          if(value !== undefined) {
            _.set(acc, path, value);
          }
        }
        return acc;
      }, {});
      if(Object.keys(hash).reduce((acc, k) => acc || !_.isNil(hash[k]), false)) {
        this.hash = JSON.stringify(hash);
      } else {
        this.hash = null;
      }
    }
    return this.hash;
  }

  toObject(options)
  {
    options = options || {};
    const RecordSet = require('./recordset');
    return this.recordSet.table.joins.reduce((acc, join) => {
      const recordSet = _.get(this.data, join.path || join.name);
      if(recordSet instanceof RecordSet) {
        _.set(acc, join.path || join.name, recordSet.toObject(options));
      }
      return acc;
    }, this.recordSet.table.columns.fields().reduce((acc, col) => {
      let value = _.get(this.data, col.path);
      if(value === undefined && options.includeJoined) {
        value = _.get(this.recordSet.joined, col.path);
      }
      if(value !== undefined && (options.includeJoined || _.isNil(_.get(this.recordSet.joined, col.path)))) {
        _.set(acc, col.path, value);
      }
      return acc;
    }, {}));
  }

  toJSON()
  {
    return JSON.stringify(this.toObject({ includeJoined: true }));
  }

}

module.exports = Record;
