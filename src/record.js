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
  }

  hashKey()
  {
    if(this.hash === undefined) {
      const hash = this.table.columns.fields().reduce((acc, col) => {
        const path = col.path;
        if(col.primaryKey || _.has(this.recordSet.joined, path)) {
          let value = _.get(this.data, path);
          if(value !== undefined) {
            _.set(acc, path, value);
          }
        }
        return acc;
      }, {});
      if(Object.keys(hash).reduce((acc, k) => acc || !_.isNil(hash[k]), false)) {
        this.hash = JSON.stringify(hash);
      } else {
        this.hash = null;
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

  validate(context)
  {
    this.valid = true;
    this.errors = {};
    const RecordSet = require('./recordset');
    this.table.columns.values(this.data, null, true).forEach(({ col, value }) => {
      if(col.calc) {
        return;
      }
      const path = col.path;
      const joinedValue = _.get(this.recordSet.joined, path);
      if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
        _.set(acc.errors, path, `join mismatch. Parent: '${joinedValue}', child: '${value}'`);
        this.valid = false;
        return;
      }
      if(col.notNull && _.isNil(value)) {
        if(!_.has(this.errors, path)) {
          _.set(this.errors, path, col.validationError || 'Field must not be null');
          this.valid = false;
        }
        return;
      } else if(!col.notNull && _.isNil(value)) {
        return;
      }
      if(col.validate) {
        const validate = v => {
          if(_.isString(v)) {
            if(`${value}` !== v) {
              return { path, error: col.validationError || 'Field is not valid' };
            }
            return null;
          }
          if(_.isRegExp(v)) {
            if(!v.test(value)) {
              return { path, error: col.validationError || `Field did not conform to regular expression '${v.toString()}'` }
            }
            return null;
          }
          if(_.isFunction(v)) {
            try {
              const result = v(value, col, context);
              if(result === true) {
                return null;
              }
              return { path, error: result || col.validationError || 'Field failed function validation' }
            } catch(error) {
              return { path, error: (error instanceof Error?error.message:error) || col.validationError || 'Field failed function validation' };
            }
          }
          if(_.isArray(v)) {
            return v.reduce((acc, v) => {
              if(_.isNil(acc)) {
                return acc;
              }
              const result = validate(v);
              if(_.isNil(result)) {
                return null;
              }
              return acc;
            }, { path, error: col.validationError || 'Field did not match any validator' });
          }
        }
        const result = validate(col.validate);
        if(result) {
          this.valid = false;
          _.set(this.errors, path, result.error);
        }
      }
      return;
    });
    this.table.joins.forEach(join => {
      const path = join.path || join.name;
      const subRecord = _.get(this.data, path);
      if(subRecord instanceof RecordSet) {
        subRecord.validate(context);
        if(!subRecord.valid) {
          this.valid = false;
        }
      }
    });
    return this;
  }

  validateAsync(context)
  {
    const RecordSet = require('./recordset');
    this.valid = true;
    this.errors = {};
    return Promise.all(this.table.columns.values(this.data, null, true).reduce((acc, { col, value }) => {
      if(col.calc) {
        return acc;
      }
      const path = col.path;
      let joinedValue = _.get(this.recordSet.joined, path);
      if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
        return acc.concat({ path, error: `join mismatch. Parent: '${joinedValue}', child: '${value}'` });
      }
      if(value === undefined) {
        value = joinedValue;
      }
      if(col.notNull && _.isNil(value)) {
        return acc.concat({ path, error: col.validationError || 'Field must not be null' });
      }
      if(!col.notNull && value === null) {
        return acc;
      }
      if(col.validate) {
        const validate = async v => {
          if(_.isString(v)) {
            if(`${value}` !== v) {
              return { path, error: col.validationError || 'Field is not valid' };
            }
            return null;
          }
          if(_.isRegExp(v)) {
            if(!v.test(value)) {
              return { path, error: col.validationError || `Field did not conform to regular expression '${v.toString()}'` }
            }
            return null;
          }
          if(_.isFunction(v)) {
            try {
              const result = await v(value, col, context);
              if(result === true) {
                return null;
              }
              return { path, error: result || col.validationError || 'Field failed function validation' };
            } catch(error) {
              return { path, error: (error instanceof Error?error.message:error) || col.validationError || 'Field failed function validation' };
            }
          }
          if(_.isArray(v)) {
            return (await Promise.all(v, validate)).reduce((acc, result) => {
              if(!acc.error) {
                return acc;
              }
              if(!result.error) {
                delete acc.error;
              }
              return acc;
            }, { path, error: col.validationError || 'Field did not match any validator' });
          }
          return null;
        }
        return acc.concat(validate(col.validate));
      }
      return acc.concat({ path, value });
    }, []).concat(this.table.joins.reduce((acc, join) => {
      return acc.concat(new Promise(resolve => {
        if(_.isFunction(join.table.config.context)) {
          resolve(join.table.config.context({ ...context }));
        } else {
          resolve({ ...context, ...join.table.config.context });
        }
      }).then(context => {
        const path = join.path || join.name;
        const recordSet = _.get(this.data, path);
        if(recordSet instanceof RecordSet) {
          return recordSet.validateAsync(context);
        }
      }));
    }, []))).then(result => {
      result.forEach(result => {
        if(result instanceof RecordSet) {
          if(!result.valid) {
            this.valid = false;
          }
          return;
        }
        if(result && result.error) {
          this.valid = false;
          _.set(this.errors, result.path, result.error);
        }
      });
      return this;
    });
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

  fill(context)
  {
    const RecordSet = require('./recordset');
    this.table.columns.fields().forEach(col => {
      const path = col.path;
      let value = _.get(this.data, path);
      if(value === undefined) {
        value = _.get(this.recordSet.joined, path);
      }
      if(col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
        if(_.isFunction(col.default)) {
          value = col.default(col, context);
        } else {
          value = col.default;
        }
        _.set(this.data, path, value);
        col.joinedTo.forEach(path => {
          _.set(this.recordSet.joined, path, value);
        });
      }
    });
    this.table.joins.forEach(join => {
      const path = join.path || join.name;
      const subRecord = _.get(this.data, path);
      if(subRecord instanceof RecordSet) {
        Object.assign(subRecord.joined, _.get(this.recordSet.joined, path));
        if(_.isFunction(join.table.config.context)) {
          subRecord.fill(join.table.config.context({ ...context }));
        }
        subRecord.fill({ ...context, ...join.table.config.context });
      }
    });
    return this;
  }

  fillAsync(context)
  {
    const RecordSet = require('./recordset');
    return Promise.all(this.table.columns.fields().map(col => {
      const path = col.path;
      let value = _.get(this.data, path);
      if(_.isNil(_.get(this.recordSet.joined, path)) && col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
        if(_.isFunction(col.default)) {
          return col.default(col, context).then(value => {
            _.set(record.data, path, value);
          });
        } else {
          value = col.default;
        }
        _.set(this.data, path, value);
        col.joinedTo.forEach(path => {
          _.set(this.recordSet.joined, path, value);
        });
      }
    })).then(() => {
      return Promise.all(this.table.joins.map(join => {
        return new Promise(resolve => {
          if(_.isFunction(join.table.config.context)) {
            resolve(join.table.config.context({ ...context }));
          } else {
            resolve({ ...context, ...join.table.config.context });
          }
        }).then(context => {
          const path = join.path || join.name;
          const subRecord = _.get(this.data, path);
          if(subRecord instanceof RecordSet) {
            Object.assign(subRecord.joined, _.get(this.recordSet.joined, path));
            if(_.isFunction(join.table.config.context)) {
              return subRecord.fillAsync(join.table.config.context({ ...context }));
            }
            return subRecord.fillAsync({ ...context, ...join.table.config.context });
          }
        });
      }));
    }).then(() => {
      return this;
    });
  }

  insert(options)
  {
    return this.table.insert(this.data, options);
  }

  Insert(options)
  {
    return this.table.Insert(this.data, options);
  }

  InsertIgnore(options)
  {
    return this.table.InsertIgnore(this.data, options);
  }

  update(options)
  {
    return this.table.update(this.data, null, { joins: [], safe: true, ...options });
  }

  Update(options)
  {
    return this.table.Update(this.data, null, { joins: [], safe: true, ...options });
  }

  delete(options)
  {
    return this.table.delete(this.data, { joins: [], safe: true, ...options });
  }

  Delete(options)
  {
    return this.table.Delete(this.data, { joins: [], safe: true, ...options });
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
          return next(f(acc, _.get(this.data, join.path || join.name)));
        }
        return next(acc);
      });
    }
    return next(acc);
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
