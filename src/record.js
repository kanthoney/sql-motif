'use strict';

const _ = require('lodash');
const Selector = require('./selector');

class Record
{
  constructor(recordSet, data)
  {
    this.recordSet = recordSet;
    this.table = this.recordSet.join.table;
    this.data = data;
    this.errors = {};
    this.dirty = true;
    this.joined = {};
    this.empty = false;
  }
  
  static fromSQLLine(recordSet, line, options)
  {
    options = options || {};
    const RecordSet = require('./recordset');
    let empty = true;
    let { recordData, joined, subTableRecords } = recordSet.join.table.columns.fields().reduce((acc, col) => {
      const alias = col.table.config.path.concat(col.alias || col.name).join('_');
      let value = _.get(line, alias);
      if(!_.isNil(value)) {
        empty = false;
      }
      if(value === undefined) {
        value = _.get(recordSet.joined, col.path);
      }
      if(value !== undefined) {
        if(_.isFunction(col.format)) {
          value = col.format(value);
        }
        if(col.subTablePath && col.subTablePath.length > 0) {
          if(!acc.subTableRecords) {
            acc.subTableRecords = {};
          }
          _.set(acc.subTableRecords, col.subTableColPath, value);
          acc.joined = col.subTableJoinedTo.reduce((acc, path) => {
            _.set(acc, path, value);
            return acc;
          }, acc.joined || {});
        } else {
          _.set(acc.recordData, col.subTableColPath || col.path, value);
        }
        const joinedTo = col.joinedTo.concat(col.subTableJoinedTo || []);
        acc.joined = joinedTo.reduce((acc, path) => {
          _.set(acc, path, value);
          return acc;
        }, acc.joined);
      }
      return acc;
    }, { recordData: {}, joined: {} });
    if(subTableRecords) {
      let table = recordSet.subTable;
      while(table) {
        table.joins.forEach(join => {
          const data = _.get(subTableRecords, join.path || join.name);
          if(data !== undefined) {
            let collate;
            if(options.collate) {
              collate = (new Selector(options.collate)).passesJoin(join);
            }
            const subRecordSet = new RecordSet(join.table, _.get(Object.assign({}, recordSet.joined, joined), join.path || join.name));
            subRecordSet.addRecord(data, { collate });
            _.set(recordData, join.path || join.name, subRecordSet);
          }
        });
        if(!table.config.subtable) {
          break;
        }
        table = table.config.subtable.table;
      }
    }
    const record = new Record(recordSet, empty?{}:recordData);
    record.joined = joined;
    record.empty = empty;
    recordSet.join.table.joins.forEach(join => {
      let collate;
      if(options.collate) {
        collate = new Selector(options.collate).passesJoin(join);
      }
      let subRecordSet = _.get(record.data, join.path || join.name);
      if(subRecordSet === undefined) {
        subRecordSet = new RecordSet(join, _.get(Object.assign({}, recordSet.joined, record.joined), join.path || join.name));
        subRecordSet.addSQLResult(line, { collate });
        if(subRecordSet.length > 0) {
          record.empty = false;
        }
        _.set(record.data, join.path || join.name, subRecordSet);
      } else {
        subRecordSet.addSQLResult(line, { collate });
        record.empty = false;
      }
    });
    return record;
  }

  hashKey(collate)
  {
    const RecordSet = require('./recordset');
    collate = collate || this.collate || (col => col.primaryKey);
    if(this.hash === undefined || this.dirty || this.collate !== collate) {
      this.collate = collate;
      let empty = true;
      this.fullKey = true;
      const hash = this.table.columns.fields(collate).reduce((acc, col) => {
        const path = col.path;
        let value = _.get(this.data, path);
        if(_.isNil(value)) {
          value = _.get(this.recordSet.joined, col.path);
        }
        if(_.isNil(value)) {
          const joinedTo = col.joinedTo.concat(col.subTableJoinedTo || []);
          for(let i = 0; i < joinedTo.length && _.isNil(value); i++) {
            let path = joinedTo[i];
            value = this.data;
            for(let j = 0; j < path.length; j++) {
              value = _.get(value, path[j]);
              if(value instanceof RecordSet) {
                if(value.length > 0) {
                  value = value.get('[0]').toJSON();
                } else {
                  value = null;
                  break;
                }
              }
            }
          }
        }
        if(_.isNil(value)) {
          this.fullKey = false;
          return acc.concat(null);
        } else {
          empty = false;
          return acc.concat(value);
        }
        return acc;
      }, []);
      if(empty) {
        this.hash = null;
      } else {
        this.hash = JSON.stringify(hash);
      }
    }
    return this.hash;
  }

  merge(other)
  {
    const RecordSet = require('./recordset');
    if(this.hash !== other.hashKey()) {
      return this;
    }
    let table = this.table;
    while(table) {
      table.joins.forEach(join => {
        let collate;
        if(this.collate) {
          collate = (new Selector(this.collate)).passesJoin(join);
        }
        const subRecord = _.get(this.data, join.path || join.name);
        const otherRecord = _.get(other.data, join.path || join.name);
        if(subRecord instanceof RecordSet) {
          if(otherRecord) {
            subRecord.addRecord(otherRecord, { collate });
          }
        } else if(otherRecord) {
          const recordSet = new RecordSet(otherRecord.recordSet.table, otherRecord.recordSet.joined);
          recordSet.addRecord(otherRecord, { collate });
          _.set(this.data, join.path || join.name, recordSet);
        }
      });
      if(!table.config.subtable) {
        break;
      }
      table = table.config.subtable.table;
    }
    return this;
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
        path = path.slice(1);
      }
    }
    return value;
  }

  validate(options = {})
  {
    let { context, selector, ignoreMissing, ignoreMissingNonKey } = options;
    this.valid = true;
    this.errors = {};
    if(this.table.config.context) {
      if(this.table.config.context instanceof Function) {
        context = this.table.config.context({ record: this, context });
      } else {
        context = { ...this.table.config.context, ...context };
      }
    }
    const RecordSet = require('./recordset');
    this.table.columns.validateRecord(this, options);
    this.table.joins.forEach(join => {
      const path = join.path || join.name;
      const subRecord = _.get(this.data, path);
      if(subRecord instanceof RecordSet) {
        if(join.context) {
          if(join.context instanceof Function) {
            context = join.context({ record: this, recordSet: subRecord, context: { ...context } });
          } else {
            context = { ...join.context, ...context };
          }
        }
        subRecord.validate({ ...options, context });
        if(!subRecord.valid) {
          this.valid = false;
        }
      }
    });
    return this;
  }

  validateKey(options)
  {
    return this.validate({ ...options, selector: col => col.primaryKey });
  }

  validateAsync(options = {})
  {
    let { context, selector, ignoreMissing, ignoreMissingNonKey } = options;
    const RecordSet = require('./recordset');
    this.valid = true;
    this.errors = {};
    return Promise.resolve(context).then(context => {
      if(this.table.config.context) {
        if(this.table.config.context instanceof Function) {
          return this.table.config.context({ record: this, context });
        } else {
          return { ...this.table.config.context, ...context };
        }
      }
      return context;
    }).then(context => {
      return this.table.columns.validateAsync(this, { ...options, context }).then(results => {
        return Promise.all(results.concat(this.table.joins.reduce((acc, join) => {
          const path = join.path || join.name;
          const recordSet = _.get(this.data, path);
          return acc.concat(new Promise(resolve => {
            if(join.context) {
              if(join.context instanceof Function) {
                context = join.context({ record: this, recordSet, context: { ...context } });
              } else {
                context = { ...join.context, ...context };
              }
            }
            resolve(context);
          }).then(context => {
            if(recordSet instanceof RecordSet) {
              return recordSet.validateAsync({ ...options, context });
            }
          }));
        }, [])));
      });
    }).then(result => {
      const process = result => {
        if(result instanceof RecordSet) {
          if(!result.valid) {
            this.valid = false;
          }
          return;
        } else if(_.isArray(result)) {
          return result.forEach(process);
        } else if(result && result.error) {
          this.valid = false;
          _.set(this.errors, result.path, result.error);
        }
      };
      process(result);
      return this;
    });
  }

  validateKeyAsync(options)
  {
    return this.validateAsync({ ...options, selector: col => primaryKey});
  }

  validationResult()
  {
    const RecordSet = require('./recordset');
    return this.table.joins.reduce((acc, join) => {
      const subRecords = _.get(this.data, join.path || join.name);
      if(subRecords instanceof RecordSet) {
        const result = subRecords.validationResult();
        if(!result.valid) {
          acc.valid = false;
          _.set(acc.errors, join.path || join.name, result.results.map(result => result.errors));
        }
        _.set(acc.record, join.path || join.name, result.results.map(result => result.record));
      }
      return acc;
    }, { record: this.toObject({ mapJoined: true, includeJoined: true, noSubRecords: true }), valid: this.valid, errors: this.errors });
  }

  fill(options = {})
  {
    let { context, selector } = options;
    this.dirty = true;
    Object.assign(this.joined, this.recordSet.joined);
    if(this.table.config.context) {
      if(this.table.config.context instanceof Function) {
        context = this.table.config.context({ record: this, context });
      } else {
        context = { ...this.table.config.context, ...context };
      }
    }
    this.table.columns.fill(this, options);
    const RecordSet = require('./recordset');
    this.table.joins.forEach(join => {
      if(join.readOnly || (options.joins && options.joins !== '*' && !includes(options.joins(join.name)))) {
        return;
      }
      const path = join.path || join.name;
      const recordSet = _.get(this.data, path);
      if(recordSet instanceof RecordSet) {
        Object.assign(recordSet.joined, _.get(this.joined, path));
        if(join.context) {
          if(join.context instanceof Function) {
            context = join.context({ record: this, recordSet, context: { ...context } });
          } else {
            context = { ...join.context, ...context };
          }
        }
        recordSet.fill({ ...options, context });
      }
    });
    return this;
  }

  fillAsync(options = {})
  {
    let { context, selector } = options;
    const RecordSet = require('./recordset');
    this.dirty = true;
    Object.assign(this.joined, this.recordSet.joined);
    return Promise.resolve(context).then(context => {
      if(this.table.config.context) {
        if(this.table.config.context instanceof Function) {
          return this.table.config.context({ record: this, context });
        }
        return { ...this.table.config.context, ...context };
      }
      return context;
    }).then(context => {
      return this.table.columns.fillAsync(this, options).then(() => {
        return Promise.all(this.table.joins.map(join => {
          const path = join.path || join.name;
          const recordSet = _.get(this.data, path);
          return new Promise(resolve => {
            if(join.context) {
              if(join.context instanceof Function) {
                context = join.context({ record: this, recordSet, context: { ...context } });
              } else {
                context = { ...join.context,  ...context };
              }
            }
            resolve(context);
          }).then(context => {
            if(recordSet instanceof RecordSet) {
              Object.assign(recordSet.joined, _.get(this.joined, path));
              if(join.readOnly || (options.joins && options.joins !== '*' && !includes(options.joins(join.name)))) {
                return recordSet;
              }
              return recordSet.fillAsync({ ...options, context });
            }
          });
        }));
      });
    }).then(() => {
      return this;
    });
  }

  scope(scope)
  {
    this.dirty = true;
    this.table.columns.scope(this.scope);
    this.table.joins.forEach(join => {
      const recordSet = _.get(this.data, join.path || join.name);
      const subScope = Object.assign({}, _.get(this.recordSet.joined, join.path || join.name), _.get(scope, join.path || join.name));
      if(recordSet) {
        recordSet.scope(subScope);
      }
    });
    return this;
  }

  key()
  {
    return this.table.columns.key(this);
  }

  keyScope(scope)
  {
    return this.table.columns.keyScope(this, scope);
  }

  Insert(options)
  {
    return this.table.Insert(this.data, options);
  }

  insert(options)
  {
    return this.table.insert(this.data, options);
  }

  insertColumns(options)
  {
    return this.table.insertColumns(this.data, options);
  }

  insertValues(options)
  {
    const values = this.table.columns.insertValues(this);
    return `(${values.join(', ')})`;
  }

  InsertIgnore(options)
  {
    return this.table.InsertIgnore(this.data, options);
  }

  Update(options)
  {
    return this.table.Update(this.data, null, { joins: [], safe: true, ...options });
  }

  update(options)
  {
    return this.table.update(this.data, null, { joins: [], safe: true, ...options });
  }

  UpdateKey(key, options)
  {
    return this.table.Update(this.data, this.keyScope(key), { joins: [], safe: true, ...options });
  }

  updateKey(key, options)
  {
    return this.table.update(this.data, this.keyScope(key), { joins: [], safe: true, ...options });
  }

  UpdateWhere(where, options)
  {
    return this.table.UpdateWhere(this.data, where, { joins: [], safe: true, ...options });
  }

  updateWhere(where, options)
  {
    return this.table.updateWhere(this.data, where, { joins: [], safe: true, ...options });
  }

  Delete(options)
  {
    return this.table.Delete(this.data, { joins: [], safe: true, ...options });
  }

  delete(options)
  {
    return this.table.delete(this.data, { joins: [], safe: true, ...options });
  }

  reduceSubtables(f, acc)
  {
    return this.table.joins.reduce((acc, join) => {
      const recordSet = _.get(this.data, join.path || join.name);
      if(recordSet !== undefined) {
        return f(acc, recordSet);
      }
      return acc;
    }, acc);
  }

  reduceSubtablesAsync(f, acc)
  {
    const it = this.table.joins[Symbol.iterator]();
    const next = acc => {
      const n = it.next();
      if(n.done) {
        return Promise.resolve(acc);
      }
      const join = n.value;
      return Promise.resolve(acc).then(acc => {
        const recordSet = _.get(this.data, join.path || join.name);
        if(recordSet !== undefined) {
          return next(f(acc, join, _.get(this.data, join.path || join.name)));
        }
        return next(acc);
      });
    }
    return next(acc);
  }

  forEachSubtable(f)
  {
    return this.table.joins.forEach(join => {
      const subRecord = _.get(this.data, join.path || join.name);
      if(subRecord) {
        f(join, subRecord);
      }
    });
  }

  mapSubtables(f)
  {
    return this.reduceSubtables((acc, join, recordSet) => {
      return acc.concat(f(join, recordSet));
    }, []);
  }

  toObject(options)
  {
    const RecordSet = require('./recordset');
    options = options || {};
    let table = this.table;
    while(table.config.subquery) {
      table = table.config.subquery.table;
    }
    let acc = table.columns.fields('*', true).reduce((acc, col) => {
      let path = col.path;
      let value = _.get(this.data, path);
      if(value === undefined && options.mapJoined) {
        value = _.get(this.recordSet.joined, col.path);
      }
      if(value !== undefined && (options.includeJoined || _.isNil(_.get(this.recordSet.joined, col.path)))) {
        _.set(acc, path, value);
      }
      return acc;
    }, {});
    table = this.table;
    while(table) {
      if(!options.noSubRecords) {
        acc = table.joins.reduce((acc, join) => {
          const recordSet = _.get(this.data, join.path || join.name);
          if(recordSet instanceof RecordSet) {
            if(join.reducer) {
              _.set(acc, join.path || join.name, recordSet.reduce(join.reducer));
            } else if(join.single) {
              if(recordSet.length === 1) {
                _.set(acc, join.path || join.name, recordSet.get('[0]').toObject(options));
              } else if(recordSet.length > 0) {
                _.set(acc, join.path || join.name, recordSet.toObject(options));
              }
            } else {
              _.set(acc, join.path || join.name, recordSet.toObject(options));
            }
          }
          return acc;
        }, acc);
      }
      if(table.config.subtable) {
        table = table.config.subtable.table;
      } else {
        break;
      }
    }
    return acc;
  }

  toJSON()
  {
    return this.toObject({ mapJoined: true, includeJoined: true });
  }

}

module.exports = Record;
