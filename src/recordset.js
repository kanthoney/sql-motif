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
      if(col.calc) {
        console.log(col);
      }
      if(value === undefined) {
        value = _.get(this.joined, col.path);
      }
      if(value !== undefined) {
        if(_.isFunction(col.format)) {
          _.set(acc.recordData, col.path, col.format(value));
        } else {
          _.set(acc.recordData, col.path, value);
        }
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
    if(record instanceof RecordSet) {
      return this.addRecord(record.records);
    }
    if(record instanceof Record) {
      this.records.push(record);
      const hash = record.hashKey();
      if(hash) {
        this.recordMap[hash] = record;
      }
      return this;
    }
    if(_.isArray(record)) {
      record.forEach(record => this.addRecord(record));
      return this;
    }
    const { recordData, joined } = this.join.table.columns.fields().reduce((acc, col) => {
      const path = col.path;
      let value = _.get(record, path);
      if(value === undefined) {
        value = _.get(this.joined, path);
      }
      if(value !== undefined) {
        _.set(acc.recordData, path, value);
        acc.joined = col.joinedTo.reduce((acc, path) => {
          const calcPath = (left, right) => {
            if(left.length === 0) {
              return right;
            }
            if(right.length === 0 || left[0] !== right[0]) {
              return null;
            }
            return calcPath(left.slice(1), right.slice(1));
          }
          const relPath = calcPath(this.join.table.config.path, path);
          if(relPath) {
            _.set(acc, relPath, value);
          }
          return acc;
        }, acc.joined);
      }
      return acc;
    }, { recordData: {}, joined: { ...this.joined } });
    let r = new Record(this, recordData);
    r.joined = joined;
    this.join.table.joins.forEach(join => {
      const value = _.get(record, join.path || join.name);
      if(value !== undefined) {
        let recordSet = _.get(r.data, join.path || join.name);
        if(recordSet === undefined) {
          recordSet = new RecordSet(join, Object.assign({}, _.get(r.joined, join.path || join.name)));
          _.set(r.data, join.path || join.name, recordSet);
        }
        recordSet.addRecord(value);
      }
    });
    return this.addRecord(r);
  }

  validate(options = {})
  {
    this.valid = true;
    const table = this.join.table;
    return this.records.reduce((acc, record) => {
      if(!record.validate(options).valid) {
        acc.valid = false;
      }
      return acc;
    }, this);
  }

  validateKey(options)
  {
    return this.validate({ ...options, selector: col => col.primaryKey });
  }

  validateAsync(options = {})
  {
    this.valid = true;
    return Promise.all(this.records.map(record => {
      return record.validateAsync(options);
    })).then(records => {
      records.forEach(record => {
        if(!record.valid) {
          this.valid = false;
        }
      });
      return this;
    });
  }

  validateKeyAsync(options)
  {
    return this.validateAsync({ ...options, selector: col => col.primaryKey});
  }

  validationResult()
  {
    return { results: this.records.map(record => record.validationResult()), valid: this.valid };
  }

  fill(options = {})
  {
    this.records.forEach(record => {
      const oldHash = record.hashKey();
      record.fill(options);
      const hash = record.hashKey();
      if(hash !== oldHash) {
        delete this.recordMap[oldHash];
        this.recordMap[hash] = record;
      }
    });
    return this;
  }

  fillAsync(options = {})
  {
    return Promise.all(this.records.map(record => {
      const oldHash = record.hashKey();
      return record.fillAsync(options).then(record => {
        const hash = record.hashKey();
        if(hash !== oldHash) {
          delete this.recordMap[oldHash];
          this.recordMap[hash] = record;
        }
        return record;
      });
    })).then(() => {
      return this;
    });
  }

  scope(scope)
  {
    this.forEach(record => record.scope(scope));
    return this;
  }

  reduce(f, acc)
  {
    return this.records.reduce(f, acc);
  }

  forEach(f)
  {
    return this.records.forEach(f);
  }

  map(f)
  {
    return this.records.map(f);
  }

  filter(f)
  {
    const recordSet = new RecordSet(this.join, this.joined);
    if(this.valid !== undefined) {
      recordSet.valid = true;
    }
    return this.reduce((acc, record) => {
      if(f(record)) {
        acc.records.push(record);
        const hash = record.hashKey();
        acc.recordMap[hash] = record;
        if(record.valid === false) {
          acc.valid = false;
        }
      }
      return acc;
    }, recordSet);
  }

  slice(...args)
  {
    const recordSet = new RecordSet(this.join, this.joined);
    this.records.slice(...args).forEach(record => {
      recordSet.records.push(record);
      const hash = record.hashKey();
      recordSet.recordMap[hash] = record;
    });
    return recordSet;
  }

  reduceAsync(f, acc)
  {
    const it = this.records[Symbol.iterator]();
    const next = acc => {
      const n = it.next();
      if(n.done) {
        return Promise.resolve(acc);
      }
      return Promise.resolve(acc).then(acc => f(acc, n.value)).then(next);
    }
    return next(acc);
  }

  Insert(options)
  {
    options = options || {};
    return [].concat(this.join.table.Insert(this, options) || []).concat(this.reduce((acc, record) => {
      return record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.Insert(options));
      }, acc);
    }, []));
  }

  insert(options)
  {
    options = options || {};
    return [].concat(this.join.table.insert(this, options) || []).concat(this.reduce((acc, record) => {
      return record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.insert(options));
      }, acc);
    }, []));
  }

  insertColumns(options)
  {
    return this.join.table.insertColumns(options);
  }

  insertValues(options)
  {
    return this.map(record => record.insertValues(options));
  }

  InsertIgnore(options)
  {
    options = options || {};
    return [].concat(this.join.table.InsertIgnore(this.records, options) || []).concat(this.reduce((acc, record) => {
      return record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.InsertIgnore(options));
      }, acc);
    }, []));
  }

  Update(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.Update(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.Update(options));
      }, []));
    }, []);
  }

  update(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.update(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.update(options));
      }, []));
    }, []);
  }

  Delete(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.Delete(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.Delete(options));
      }, []));
    }, []);
  };

  delete(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.delete(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(recordSet.join.name))) {
          return acc;
        }
        return acc.concat(recordSet.delete(options));
      }, []));
    }, []);
  };

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

  get length()
  {
    return this.records.length;
  }

};

module.exports = RecordSet;
