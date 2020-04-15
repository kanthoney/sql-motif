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
        if(col.primaryKey) {
          let value = _.get(this.data, col.path || col.alias || col.name);
          return acc.concat(value);
        }
        return acc;
      }, []);
      if(hash.filter(col => !_.isNil(col)).length === 0) {
        this.hash = null;
      } else {
        this.hash = JSON.stringify(hash);
      }
    }
    return this.hash;
  }

  joinValue(col)
  {
    const parent = this.recordSet.parent;
    if(!parent instanceof Record) {
      return;
    }
    return parent.recordSet.joinValue(col);
  }

  toObject()
  {
    const RecordSet = require('./recordset');
    const parentTable = this.recordSet.parent?this.recordSet.parent.recordSet.table:null;
    return this.recordSet.table.joins.reduce((acc, join) => {
      const recordSet = _.get(this.data, join.path || join.name);
      if(recordSet instanceof RecordSet) {
        _.set(acc, join.path || join.name, recordSet.toObject());
      }
      return acc;
    }, this.recordSet.table.columns.fields().reduce((acc, col) => {
      const value = _.get(this.data, col.path || col.alias || col.name);
      if(value !== undefined) {
        _.set(acc, col.path || col.alias || col.name, value);
      }
      return acc;
    }, {}));
  }

  toJSON()
  {
    return JSON.stringify(this.toObject());
  }

}

module.exports = Record;
