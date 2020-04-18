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

  get(path)
  {
    const RecordSet = require('./recordset');
    path = _.toPath(path);
    let value = this;
    while(path.length > 0 && value !== undefined) {
      if(value instanceof Record) {
        value = value.data[path[0]];
        path = path.slice(1);
      } else if(value instanceof RecordSet) {
        return value.get(path);
      } else {
        value = value[path[0]];
        path = path.slice[1];
      }
    }
    return value;
  }

  toObject(options)
  {
    const RecordSet = require('./recordset');
    options = options || {};
    return this.recordSet.table.joins.reduce((acc, join) => {
      const recordSet = _.get(this.data, join.path || join.name);
      if(recordSet instanceof RecordSet) {
        _.set(acc, join.path || join.name, recordSet.toObject(options));
      }
      return acc;
    }, this.recordSet.table.columns.fields('*', true).reduce((acc, col) => {
      let value = _.get(this.data, col.path);
      if(value === undefined && options.mapJoined) {
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
    return this.toObject({ mapJoined: true, includeJoined: true });
  }

}

module.exports = Record;
