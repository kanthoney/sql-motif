'use strict';

const _ = require('lodash');
const Record = require('./record');

class RecordSet
{
  constructor(join, joined)
  {
    const Table = require('./table');
    if(join instanceof Table) {
      this.join = { table: join };
    } else {
      this.join = join;
    }
    this.joined = joined || {};
    this.records= [];
    this.recordMap = {};
  }

  addSQLResult(line)
  {
    if(_.isArray(line)) {
      line.forEach(line => this.addSQLResult(line));
      return this;
    }
    let empty = true;
    const { recordData, joined } = this.join.table.columns.fields().reduce((acc, col) => {
      const alias = col.table.config.path.concat(col.alias || col.name).join('_');
      let value = _.get(line, alias);
      if(!_.isNil(value)) {
        empty = false;
      }
      if(value === undefined) {
        value = _.get(this.joined, col.path);
      }
      if(value !== undefined) {
        _.set(acc.recordData, col.path, value);
      }
      acc.joined = col.joinedTo.reduce((acc, path) => {
        _.set(acc, path, value);
        return acc;
      }, acc.joined);
      return acc;
    }, { recordData: {}, joined: {} });
    let record = new Record(this, empty?{}:recordData);
    const hash = record.hashKey();
    if(this.recordMap[hash] !== undefined) {
      record = this.recordMap[hash];
    }
    this.join.table.joins.forEach(join => {
      empty = false;
      let recordSet = _.get(record.data, join.path || join.name);
      if(recordSet === undefined) {
        recordSet = new RecordSet(join, Object.assign({}, _.get(joined, join.table.config.path), _.get(this.joined, join.path || join.name)));
        _.set(record.data, join.path || join.name, recordSet);
      }
      recordSet.addSQLResult(line);
    });
    if(!empty && this.recordMap[hash] === undefined) {
        this.records.push(record);
        this.recordMap[hash] = record;
    }
    return this;
  }

  addRecord(record)
  {
    if(_.isArray(record)) {
      return record.forEach(record => this.addRecord(record));
    }
    const { recordData, joined } = this.join.table.columns.values(record, null, true).reduce((acc, field) => {
      let { col, value } = field;
      const path = col.path;
      if(value === undefined) {
        value = _.get(this.joined, path);
      }
      if(value !== undefined) {
        _.set(acc.recordData, path, value);
        acc.joined = col.joinedTo.reduce((acc, path) => {
          _.set(acc, path, value);
          return acc;
        }, acc.joined);
      }
      return acc;
    }, { recordData: {}, joined: {} });
    const r = new Record(this, recordData);
    const hash = r.hashKey();
    this.records.push(r);
    this.recordMap[hash] = r;
    this.join.table.joins.forEach(join => {
      const value = _.get(record, join.path || join.name);
      if(value !== undefined) {
        let recordSet = _.get(r.data, join.path || join.name);
        if(recordSet === undefined) {
          recordSet = new RecordSet(join, Object.assign({}, _.get(joined, join.table.config.path), _.get(this.joined, join.path || join.name)));
          _.set(r.data, join.path || join.name, recordSet);
        }
        recordSet.addRecord(value);
      }
    });
    return this;
  }

  validate(context)
  {
    this.valid = true;
    return this.records.reduce((acc, record) => {
      if(!record.validate(context).valid) {
        acc.valid = false;
      }
      return acc;
    }, this);
  }

  validateAsync(context)
  {
    this.valid = true;
    return Promise.all(this.records.map(record => {
      return record.validateAsync(context);
    })).then(records => {
      records.forEach(record => {
        if(!record.valid) {
          this.valid = false;
        }
      });
      return this;
    });
  }

  validationResult()
  {
    return { results: this.records.map(record => record.validationResult()), valid: this.valid };
  }

  fill(context)
  {
    this.records.forEach(record => {
      this.join.table.columns.fields().forEach(col => {
        const path = col.path;
        let value = _.get(record, path);
        if(_.isNil(_.get(this.joined, path)) && col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
          if(_.isFunction(col.default)) {
            value = col.default(col, context);
          } else {
            value = col.default;
          }
          _.set(record.data, path, value);
        }
      });
      this.join.table.joins.forEach(join => {
        const path = join.path || join.name;
        const subRecord = _.get(record, path);
        if(subRecord instanceof RecordSet) {
          subRecord.fill(context);
        }
      });
    });
    return this;
  }

  fillAsync(context)
  {
    return Promise.all(this.records.map(record => {
      return Promise.all(this.join.table.columns.fields().map(col => {
        const path = col.path;
        let value = _.get(record, path);
        if(_.isNil(_.get(this.joined, path)) && col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
          if(_.isFunction(col.default)) {
            return col.default(col, context).then(value => {
              _.set(record.data, path, value);
            });
          } else {
            value = col.default;
          }
          _.set(record.data, path, value);
        }
      })).then(() => {
        return Promise.all(this.join.table.joins.map(join => {
          const path = join.path || join.name;
          const subRecord = _.get(record, path);
          if(subRecord instanceof RecordSet) {
            return subRecord.fillAsync(context);
          }
        }));
      });
    })).then(() => {
      return this;
    });
  }

  reduce(f, acc)
  {
    acc = this.records.reduce((acc, record) => {
      return this.joins.reduce((acc, join) => {
        const subRecord = _.get(record.data, join.path || join.name);
        if(subRecord instanceof RecordSet) {
          return subRecord.reduce(f, acc);
        }
        return acc;
      }, f(acc, this.join, record.data));
    }, acc);
    return acc;
  }

  get(path)
  {
    path = _.toPath(path);
    if(path.lenth === 0) {
      return this;
    }
    const record = _.get(this.records, path[0]);
    if(record instanceof Record) {
      return record.get(path.slice(1));
    }
    return;
  }

  toObject(options)
  {
    return this.records.map(record => record.toObject(options));
  }

  toJSON()
  {
    return this.toObject({ mapJoined: true, includeJoined: true });
  }
};

module.exports = RecordSet;
