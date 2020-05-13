'use strict';

const _ = require('lodash');

class Record
{
  constructor(recordSet, data)
  {
    this.recordSet = recordSet;
    this.table = this.recordSet.join.table;
    this.data = data;
    this.valid = true;
    this.errors = {};
    this.dirty = true;
    this.joined = {};
  }

  hashKey()
  {
    if(this.hash === undefined || this.dirty) {
      let empty = true;
      const hash = this.table.columns.fields().reduce((acc, col) => {
        const path = col.path;
        let value = _.get(this.data, path);
        if(!_.isNil(value)) {
          empty = false;
        }
        if(col.primaryKey || _.has(this.recordSet.joined, path)) {
          if(_.isNil(value)) {
            value = _.get(this.recordSet.joined, path);
          }
          if(value === undefined) {
            return acc.concat(null);
          } else {
            return acc.concat(value);
          }
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

  validate(options = {})
  {
    let { context, selector, ignoreMissing, ignoreMissingNonKey } = options;
    this.valid = true;
    this.errors = {};
    if(this.table.config.context) {
      if(this.table.config.context instanceof Function) {
        context = this.table.config.context(this, context);
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
            context = join.context(subRecord, { ...context });
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
          return this.table.config.context(this, context);
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
                context = join.context(recordSet, { ...context });
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
        context = this.table.config.context(this, context);
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
            context = join.context(recordSet, { ...context });
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
          return this.table.config.context(this, context);
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
                context = join.context(recordSet, { ...context });
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
    const acc = this.table.columns.fields('*', true).reduce((acc, col) => {
      let value = _.get(this.data, col.path);
      if(value === undefined && options.mapJoined) {
        value = _.get(this.recordSet.joined, col.path);
      }
      if(value !== undefined && (options.includeJoined || _.isNil(_.get(this.recordSet.joined, col.path)))) {
        _.set(acc, col.path, value);
      }
      return acc;
    }, {});
    if(!options.noSubRecords) {
      return this.table.joins.reduce((acc, join) => {
        const recordSet = _.get(this.data, join.path || join.name);
        if(recordSet instanceof RecordSet) {
          _.set(acc, join.path || join.name, recordSet.toObject(options));
        }
        return acc;
      }, acc);
    }
    return acc;
  }

  toJSON()
  {
    return this.toObject({ mapJoined: true, includeJoined: true });
  }

}

module.exports = Record;
