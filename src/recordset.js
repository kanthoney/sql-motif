'use strict';

const _ = require('lodash');
const Record = require('./record');
const Selector = require('./selector');

class RecordSet
{
  constructor(table, options)
  {
    this.table = table;
    this.joins = [];
    while(table) {
      this.joins = this.joins.concat(table.joins);
      if(table.config.subtable) {
        table = table.config.subtable.table;
      } else {
        break;
      }
    }
    this.options = _.defaults(options, {
      readOnly: false,
      path: []
    });
    this.records= [];
    this.recordMap = {};
  }

  getJoined(path)
  {
    if(this.options.parent) {
      return this.options.parent.getJoined([].concat(this.options.path, path));
    }
  }

  addSQLResult(line)
  {
    if(_.isArray(line)) {
      line.forEach(line => this.addSQLResult(line));
      return this;
    }
    const record = new Record(this);
    const newJoined = {};
    this.table.columns.fields(this.options.selector).forEach(col => {
      let value = _.get(line, col.fullAlias);
      const path = col.subTableColPath || col.path;
       if(value !== undefined && col.format instanceof Function) {
        value = col.format(value);
      }
      if(value === undefined) {
        value = _.get(newJoined, path);
      }
      if(value === undefined) {
        value = record.getJoined(path);
      } else {
        if(!_.isNil(value)) {
          record.empty = false;
        }
        _.set(record.data, path, value);
      }
      if(value !== undefined) {
        col.joinedTo.concat(col.subTableJoinedTo || []).forEach(path => {
          _.set(newJoined, path, value);
        });
      }
    });
    if(this.table.config.path.length === 0) {
      record.joined = newJoined;
    } else {
      record.joined = _.get(newJoined, this.table.config.path) || {};
    }
    this.joins.forEach(join => {
      let collate, selector;
      if(this.options.collate) {
        collate = (new Selector(this.options.collate)).passesJoin(join);
      }
      if(this.options.selector) {
        selector = (new Selector(this.options.selector)).passesJoin(join);
        if(!selector) {
          return;
        }
      }
      const subRecordSet = new RecordSet(join.table, {
        collate,
        selector,
        path: join.path || join.name,
        join,
        parent: record
      });
      const subRecord = _.get(record.data, join.path || join.name);
      if(subRecord) {
        subRecordSet.importRecord(subRecord);
      } else {
        subRecordSet.addSQLResult(line);
      }
      _.set(record.data, join.path || join.name, subRecordSet);
      if(subRecordSet.length > 0) {
        record.empty = false;
      }
    });
    if(!record.empty) {
      this.addRecord(record);
    }
    return this;
  }

  importRecord(data, joined = {})
  {
    const record = new Record(this, {}, joined);
    const newJoined = {};
    this.table.columns.fields().forEach(col => {
      const path = col.subTableColPath || col.path;
      let value = _.get(data, path);
      if(value !== undefined) {
        _.set(record.data, path, value);
      } else {
        value = record.getJoined(path);
      }
      if(value !== undefined) {
        record.empty = false;
        const joinedTo = col.joinedTo.concat(col.subTableJoinedTo || []);
        joinedTo.forEach(path => {
          _.set(newJoined, path, value);
        });
      }
    });
    if(this.table.config.path.length === 0) {
      record.joined = _.merge({}, record.joined, newJoined);
    } else {
      record.joined = _.merge({}, record.joined, _.get(newJoined, this.table.config.path));
    }
    this.joins.forEach(join => {
      const subRecord = _.get(data, join.path || join.name);
      if(subRecord) {
        let collate, selector;
        if(this.options.collate) {
          collate = (new Selector(this.options.collate)).passesJoin(join);
        }
        if(this.options.selector) {
          selector = (new Selector(this.options.selector)).passesJoin(join);
          if(!selector) {
            return;
          }
        }
        const subRecordSet = new RecordSet(join.table, {
          collate,
          selector,
          join,
          path: join.path || join.name,
          parent: record
        });
        const subjoined = _.merge({}, _.get(record.joined, join.path || join.name), _.get(newJoined, join.table.config.path));
        if(_.isArray(subRecord)) {
          subRecord.forEach(subRecord => subRecordSet.importRecord(subRecord, subjoined));
        } else {
          subRecordSet.importRecord(subRecord, subjoined);
        }
        _.set(record.data, join.path || join.name, subRecordSet);
        if(subRecordSet.length > 0) {
          record.empty = false;
        }
      }
    });
    if(!record.empty || !this.options.parent) {
      this.addRecord(record);
    }
    return this;
  }

  addRecord(record)
  {
    if(record instanceof RecordSet) {
      return this.addRecord(record.records);
    }
    if(record instanceof Record) {
      const hash = record.hashKey(this.options.collate);
      if(hash && record.fullKey) {
        if(this.recordMap[hash]) {
          this.recordMap[hash].merge(record);
        } else {
          this.records.push(record);
          this.recordMap[hash] = record;
        }
      } else {
        this.records.push(record);
      }
      return this;
    } else {
      if(record instanceof Array) {
        record.forEach(record => this.addRecord(record));
      } else {
        this.importRecord(record);
      }
    }
    return this;
  }

  validate(options = {})
  {
    this.valid = true;
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

  defaults(defaults)
  {
    this.forEach(record => record.defaults(defaults));
    return this;
  }

  scope(scope, defaults)
  {
    this.forEach(record => record.scope(scope, defaults));
    return this;
  }

  key()
  {
    return this.map(record => record.key());
  }

  keyScope(scope)
  {
    return this.map(record => record.keyScope(scope));
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
    const recordSet = new RecordSet(this.tale, this.options);
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
    const recordSet = new RecordSet(this.table, this.options);
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
    return [].concat(this.table.Insert(this, options) || []).concat(this.reduce((acc, record) => {
      return record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.Insert({ ...options, selector }));
      }, acc);
    }, []));
  }

  insert(options)
  {
    options = options || {};
    return [].concat(this.table.insert(this, options) || []).concat(this.reduce((acc, record) => {
      return record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.insert({ ...options, selector }));
      }, acc);
    }, []));
  }

  insertColumns(options)
  {
    return this.table.insertColumns(options);
  }

  insertValues(options)
  {
    return this.map(record => record.insertValues(options));
  }

  InsertIgnore(options)
  {
    options = options || {};
    return [].concat(this.table.InsertIgnore(this.records, options) || []).concat(this.reduce((acc, record) => {
      return record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.InsertIgnore({ ...options, selector }));
      }, acc);
    }, []));
  }

  Update(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.Update(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.Update({ ...options, selector }));
      }, []));
    }, []);
  }

  update(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.update(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.update({ ...options, selector }));
      }, []));
    }, []);
  }

  UpdateKey(key, options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      let k = record.keyScope(key);
      return acc.concat(record.UpdateKey(k, options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.UpdateKey(_.get(k, recordSet.options.path) || {}, { ...options, selector }));
      }, []));
    }, []);
  }

  updateKey(key, options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      let k = record.keyScope(key);
      return acc.concat(record.updateKey(k, options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.updateKey(_.get(k, recordSet.options.path) || {}, { ...options, selector }));
      }, []));
    }, []);
  }

  UpdateWhere(where, options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.UpdateWhere(where, options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        const newWhere = _.get(where, recordSet.options.path);
        if(!newWhere) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.updateWhere(newWhere, { ...options, selector }));
      }, []));
    }, []);
  }

  updateWhere(where, options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.updateWhere(where, options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        const newWhere = _.get(where, recordSet.options.path);
        if(!newWhere) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.updateWhere(newWhere, { ...options, selector }));
      }, []));
    }, []);
  }

  Delete(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.Delete(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.Delete({ ...options, selector }));
      }, []));
    }, []);
  };

  delete(options)
  {
    options = options || {};
    return this.reduce((acc, record) => {
      return acc.concat(record.delete(options)).concat(record.reduceSubtables((acc, recordSet) => {
        if(recordSet.options.readOnly) {
          return acc;
        }
        let selector;
        if(options.selector && recordSet.options.join) {
          selector = (new Selector(options.selector)).passesJoin(recordSet.options.join);
          if(!selector) {
            return acc;
          }
        }
        return acc.concat(recordSet.delete({ ...options, selector }));
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
    if(this.options.reducer) {
      return this.reduce(this.options.reducer);
    }
    if(this.table.config.reducer) {
      return this.reduce(this.table.config.reducer);
    }
    return this.records.reduce((acc, record) => record.empty?acc:acc.concat(record.toObject(options)), []);
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
