'use strict';

const _ = require('lodash');
const Record = require('./record');
const private = Symbol('private');

class RecordSet
{
  constructor(table, parent)
  {
    this.table = table;
    this.parent = parent;
    this[private] = {
      records: [],
      recordMap: {}
    }
  }

  addFromSQL(line)
  {
    if(_.isArray(line)) {
      return line.map(line => this.addFromSQL(line));
    }
    const recordData = this.table.columns.reduce((acc, col) => {
      const value = _.get(line, col.alias || col.name);
      if(value !== undefined) {
        _.set(acc, col.path || col.alias || col.name, value);
      }
      return acc;
    }, {});
    let record = new Record(this, record.data);
    const hash = record.hashKey();
    if(this[private].recordMap[hash] === undefined) {
      this[private].records.push(record);
      this[private].recordMap[hash] = record;
    } else {
      record = this[private].recordMap[hash];
    }
    this.table.joins.forEach(join => {
      let recordSet = _.get(record, join.path || join.name);
      if(recordSet === undefined) {
        recordSet = new RecordSet(join.table, record);
        _.set(record, join.path || join.name, recordSet);
      }
      recordSet.addFromSQL(line);
    });
  }

  joinValue(col)
  {
    return this.table.join.reduce((acc, join) => {
      if(acc !== undefined) {
        return acc;
      }
      if(join.table !== col.table) {
        return acc;
      }
      const parentCol = join.colMap[col.alias || col.name];
      if(parentCol === undefined) {
        return acc;
      }
      const value = _.get(this[private].data, parentCol.path || parentCol.alias || parentCol.name);
      if(value !== undefined) {
        return value;
      }
      if(this.parent) {
        return this.parent.joinValue(parentCol);
      }
      return acc;
    }, undefined);
  }

  toObject()
  {
    return this[private].records.map(record => record.toObject());
  }

  toJSON()
  {
    return JSON.stringify(this.toObject());
  }
};

module.exports = RecordSet;
