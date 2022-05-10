'use strict';

const _ = require('lodash');
const Selector = require('./selector');

class Record
{
  constructor(recordSet, data, joined)
  {
    this.recordSet = recordSet;
    this.table = this.recordSet.table;
    this.data = data || {};
    this.errors = {};
    this.dirty = true;
    this.empty = !data;
    this.joined = joined || {};
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
          value = this.getJoined(path);
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
          const recordSet = new RecordSet(otherRecord.recordSet.table);
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

  getJoined(path)
  {
    const value = _.get(this.joined, path);
    if(value === undefined) {
      return this.recordSet.getJoined(path);
    }
    return value;
  }

  get(path)
  {
    const RecordSet = require('./recordset');
    path = _.toPath(path);
    let value = this;
    while(path.length > 0 && value !== undefined) {
      if(value instanceof Record) {
        let v = _.get(value.data, path);
        if(v !== undefined) {
          return v;
        }
        v = value.getJoined(path);
        if(v !== undefined) {
          return v;
        }
        value = _.get(value.data, path[0]);
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

  set(col, value)
  {
    _.set(this.data, col.subTableColPath || col.path, value);
    if(!_.isNil(value)) {
      this.empty = false;
    }
    this.dirty = true;
    const joined = col.joinedTo.reduce((acc, path) => {
      _.set(acc, path, value);
      return acc;
    }, {});
    if(this.table.config.path.length === 0) {
      _.merge(this.joined, joined);
    } else {
      _.merge(this.joined, _.get(joined, this.table.config.path));
    }
  }

  validate(options = {})
  {
    let { context, selector, ignoreMissing, ignoreMissingNonKey, includeReadOnly } = options;
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
      if(!includeReadOnly && join.readOnly) {
        return;
      }
      const path = join.path || join.name;
      const subRecord = _.get(this.data, path);
      if(subRecord instanceof RecordSet) {
        if(!includeReadOnly && subRecord.options.readOnly) {
          return;
        }
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
    let { context, selector, ignoreMissing, ignoreMissingNonKey, includeReadOnly } = options;
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
          if(!includeReadOnly && join.readOnly) {
            return acc;
          }
          const path = join.path || join.name;
          const recordSet = _.get(this.data, path);
          if(recordSet instanceof RecordSet) {
            if(!includeReadOnly && recordSet.options.readOnly) {
              return acc;
            }
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
              return recordSet.validateAsync({ ...options, context });
            }));
          }
          return acc;
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
        } else if(result) {
          if(result.error) {
            this.valid = false;
            _.set(this.errors, result.path, result.error);
          } else {
            _.set(this.data, result.path, result.value);
          }
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
          if(join.single && result.results.length === 1) {
            _.set(acc.errors, join.path || join.name, result.results[0].errors);
          } else {
            _.set(acc.errors, join.path || join.name, result.results.map(result => result.errors));
          }
        }
        if(join.single && result.results.length === 1) {
          _.set(acc.record, join.path || join.name, result.results[0].errors);
        } else {
          _.set(acc.record, join.path || join.name, result.results.map(result => result.record));
        }
      }
      return acc;
    }, { record: this.toObject({ includeJoined: true, noSubRecords: true }), valid: this.valid, errors: this.errors });
  }

  fill(options = {})
  {
    let { context, selector, includeReadOnly } = options;
    this.dirty = true;
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
      if((!includeReadOnly && join.readOnly) || (options.joins && options.joins !== '*' && !includes(options.joins(join.name)))) {
        return;
      }
      const path = join.path || join.name;
      const recordSet = _.get(this.data, path);
      if(recordSet instanceof RecordSet) {
        if(!includeReadOnly && recordSet.options.readOnly) {
          return;
        }
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
    let { context, selector, includeReadOnly } = options;
    const RecordSet = require('./recordset');
    this.dirty = true;
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
          if(!includeReadOnly && join.readOnly) {
            return;
          }
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
              if((!includeReadOnly && (join.readOnly || recordSet.options.readOnly)) || (options.joins && options.joins !== '*' && !includes(options.joins(join.name)))) {
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

  defaults(defaults)
  {
    this.table.columns.defaults(this, defaults);
    this.table.joins.forEach(join => {
      const recordSet = _.get(this.data, join.path || join.name);
      const subDefaults = Object.assign({}, _.get(defaults, join.path || join.name));
      if(recordSet) {
        recordSet.defaults(subDefaults);
      }
    });
    return this;
  }

  scope(scope = {}, defaults = {})
  {
    this.dirty = true;
    this.table.columns.scope(this, scope, defaults);
    this.table.joins.forEach(join => {
      const recordSet = _.get(this.data, join.path || join.name);
      const subScope = Object.assign({}, _.get(scope, join.path || join.name));
      const subDefaults = Object.assign({}, _.get(defaults, join.path || join.name));
      if(recordSet) {
        recordSet.scope(subScope, subDefaults);
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
    return this.table.Insert(this, options);
  }

  insert(options)
  {
    return this.table.insert(this, options);
  }

  Replace(options)
  {
    return this.table.Replace(this, options);
  }

  replace(options)
  {
    return this.table.replace(this, options);
  }

  insertColumns(options)
  {
    return this.table.insertColumns(this, options);
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
    return this.table.Update(this, null, { joins: [], safe: true, ...options });
  }

  update(options)
  {
    return this.table.update(this, null, { joins: [], safe: true, ...options });
  }

  UpdateKey(key, options)
  {
    return this.table.Update(this, key, { joins: [], safe: true, ...options });
  }

  updateKey(key, options)
  {
    return this.table.update(this, key, { joins: [], safe: true, ...options });
  }

  UpdateWhere(where, options)
  {
    return this.table.UpdateWhere(this, where, { joins: [], safe: true, ...options });
  }

  updateWhere(where, options)
  {
    return this.table.updateWhere(this, where, { joins: [], safe: true, ...options });
  }

  Delete(options)
  {
    return this.table.Delete(this, { joins: [], ...options });
  }

  delete(options)
  {
    return this.table.delete(this, { joins: [], ...options });
  }

  DeleteWhere(options)
  {
    return this.table.DeleteWhere(this, { joins: [], safe: true, ...options });
  }

  deleteWhere(options)
  {
    return this.table.deleteWhere(this, { joins: [], safe: true, ...options });
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
    const it = this.recordSet.joins[Symbol.iterator]();
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
    return this.recordSet.joins.forEach(join => {
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
      let path = col.subTableColPath || col.path;
      let value = _.get(this.data, path);
      if(value === undefined) {
        value = this.getJoined(path);
      }
      if(value !== undefined && (options.includeJoined || !col.joinCol)) {
        _.set(acc, path, value);
      }
      return acc;
    }, {});
    if(!options.noSubRecords) {
      acc = this.recordSet.joins.reduce((acc, join) => {
        if(join.hidden) {
          return acc;
        }
        const recordSet = _.get(this.data, join.path || join.name);
        if(recordSet instanceof RecordSet) {
          if(join.reducer && !options.noReducer) {
            let reduceInit = join.reduceInit;
            if(reduceInit instanceof Function) {
              reduceInit = reduceInit();
            } else {
              reduceInit = _.clone(reduceInit);
            }
            _.set(acc, join.path || join.name, recordSet.reduce(join.reducer, reduceInit));
          } else if(join.single) {
            if(recordSet.length === 1) {
              _.set(acc, join.path || join.name, recordSet.records[0].toObject(options));
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
    return acc;
  }

  toJSON()
  {
    return this.toObject({ includeJoined: true });
  }

}

module.exports = Record;
