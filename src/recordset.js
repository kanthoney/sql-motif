'use strict';

const _ = require('lodash');
const Record = require('./record');

class RecordSet
{
  constructor(table, parent)
  {
    this.table = table;
    this.parent = parent;
    this.records= [];
    this.recordMap = {};
  }

  addSQLResult(line)
  {
    if(_.isArray(line)) {
      return line.map(line => this.addSQLResult(line));
    }
    const recordData = this.table.columns.fields().reduce((acc, col) => {
      const alias = col.table.config.path.concat(col.alias || col.name).join('_');
      const value = _.get(line, alias);
      if(value !== undefined) {
        _.set(acc, col.path || col.alias || col.name, value);
      }
      return acc;
    }, {});
    let record = new Record(this, recordData);
    const hash = record.hashKey();
    if(_.isNil(hash)) {
      return;
    }
    if(this.recordMap[hash] === undefined) {
      this.records.push(record);
      this.recordMap[hash] = record;
    } else {
      record = this.recordMap[hash];
    }
    this.table.joins.forEach(join => {
      let recordSet = _.get(record.data, join.path || join.name);
      if(recordSet === undefined) {
        recordSet = new RecordSet(join.table, record);
        _.set(record.data, join.path || join.name, recordSet);
      }
      recordSet.addSQLResult(line);
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
      const value = _.get(this.data, parentCol.path || parentCol.alias || parentCol.name);
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
    return this.records.map(record => record.toObject());
  }

  toJSON()
  {
    return JSON.stringify(this.toObject());
  }
};

module.exports = RecordSet;
