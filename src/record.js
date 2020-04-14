'use strict';

const _ = require('lodash');
const private = Symbol('private');

class Record
{
  constructor(recordSet, data)
  {
    this.recordSet = recordSet;
    this[private] = {
      data
    };
  }

  hashKey()
  {
    if(!this[private].hash) {
      this[private].hash = JSON.stringify(this.recordset.table.columns.reduce((acc, col) => {
        if(col.primaryKey) {
          let value = _.get(this[private].data, col.path);
          return acc.concat(value);
        }
        return acc;
      }, []));
    }
    return this[private].hash;
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
    const RecordSet = require('recordset');
    return this.recordSet.table.joins.reduce((acc, join) => {
      const recordSet = _.get(this[private].data, join.path || join.name);
      if(recordSet instanceof RecordSet) {
        _.set(acc, join.path || join.name, recordSet.toObject);
      }
      return acc;
    }, this.recordSet.table.columns.reduce((acc, col) => {
      const value = _.get(this[private].data, col.path || col.alias || col.name);
      if(value !== undefined) {
        _.set(acc, col.path || col.alias || col.name, value);
      }
      return acc;
    }, {});
  }

  toJSON()
  {
    return JSON.stringify(this.toObject());
  }

}
