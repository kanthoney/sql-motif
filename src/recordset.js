'use strict';

const _ = require('lodash');
const Record = require('./record');

class RecordSet
{
  constructor(table, joined)
  {
    this.table = table;
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
    const { recordData, joined } = this.table.columns.fields().reduce((acc, col) => {
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
    this.table.joins.forEach(join => {
      empty = false;
      let recordSet = _.get(record.data, join.path || join.name);
      if(recordSet === undefined) {
        recordSet = new RecordSet(join.table, Object.assign({}, _.get(joined, join.table.config.path), _.get(this.joined, join.path || join.name)));
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
    const { recordData, joined } = this.table.columns.values(record, null, true).reduce((acc, field) => {
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
    this.table.joins.forEach(join => {
      const value = _.get(record, join.path || join.name);
      if(value !== undefined) {
        let recordSet = _.get(r.data, join.path || join.name);
        if(recordSet === undefined) {
          recordSet = new RecordSet(join.table, Object.assign({}, _.get(joined, join.table.config.path), _.get(this.joined, join.path || join.name)));
          _.set(r.data, join.path || join.name, recordSet);
        }
        recordSet.addRecord(value);
      }
    });
    return this;
  }

  validate(context)
  {
    return this.records.reduce((acc, record) => {
      const result = this.table.joins.reduce((acc, join) => {
        const path = join.path || join.name;
        const subRecord = _.get(record.data, path);
        if(subRecord instanceof RecordSet) {
          const result = subRecord.validate(context);
          const errors = result.results.reduce((acc, result) => {
            return acc.concat(result.errors);
          }, []);
          if(!result.valid) {
            acc.valid = false;
            _.set(acc.errors, path, errors);
          }
        }
        return acc;
      }, this.table.columns.values(record.data, null, true).reduce((acc, { col, value }) => {
        if(col.calc) {
          return acc;
        }
        const path = col.path;
        const joinedValue = _.get(this.joined, path);
        if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
          _.set(acc.errors, path, `join mismatch. Parent: '${joinedValue}', child: '${value}'`);
          acc.valid = false;
          return acc;
        }
        if(col.notNull && _.isNil(value)) {
          if(!_.has(acc.errors, path)) {
            _.set(acc.errors, path, col.validationError || 'Field must not be null');
            acc.valid = false;
          }
          return acc;
        } else if(!col.notNull && _.isNil(value)) {
          return acc;
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
            acc.valid = false;
            _.set(acc.errors, path, result.error);
          }
        }
        return acc;
      }, { record, valid: true, errors: {} }));
      if(!result.valid) {
        acc.valid = false;
      }
      acc.results.push(result);
      return acc;
    }, { results: [], valid: true });
  }

  validateAsync(context)
  {
    return Promise.all(this.records.map(record => {
      return Promise.all(this.table.columns.values(record.data, null, true).reduce((acc, { col, value }) => {
        if(col.calc) {
          return acc;
        }
        const path = col.path;
        let joinedValue = _.get(this.joined, path);
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
                return Promise.resolve(v(value, col, context)).then(result => {
                  if(result === true) {
                    return null;
                  }
                  return { path, error: result || col.validationError || 'Field failed function validation' }
                }).catch(error => {
                  return { path, error: (error instanceof Error?error.message:error) || col.validationError || 'Field failed function validation' };
                });
              } catch(error) {
                return { path, error: (error instanceof Error?error.message:error) || col.validationError || 'Field failed function validation' };
              }
            }
            if(_.isArray(v)) {
              return Promise.all(v, validate).then(result => {
                return result.reduce((acc, result) => {
                  if(!acc.error) {
                    return acc;
                  }
                  if(!result.error) {
                    delete acc.error;
                  }
                  return acc;
                }, { path, error: col.validationError || 'Field did not match any validator' });
              });
            }
            return null;
          }
          return acc.concat(validate(col.validate));
        }
        return acc.concat({ path, value });
      }, []).concat(this.table.joins.reduce((acc, join) => {
        const path = join.path || join.name;
        const recordSet = _.get(record.data, path);
        if(recordSet instanceof RecordSet) {
          return acc.concat(recordSet.validateAsync(context).then(result => {
            return result.valid?null:{ path, error: result.results.reduce((acc, result) => acc.concat(result.errors), []) }
          }));
        }
        return acc;
      }, []))).then(result => {
        return result.reduce((acc, result) => {
          if(!result) {
            return acc;
          }
          if(result.error) {
            acc.valid = false;
            _.set(acc.errors, result.path, result.error);
          }
          return acc;
        }, { record, valid: true, errors: {} });
      });
    })).then(result => {
      return result.reduce((acc, result) => {
        if(!result.valid) {
          acc.valid = false;
        }
        acc.results.push(result);
        return acc;
      }, { results: [], valid: true });
    });
  }

  fill(context)
  {
    this.records.forEach(record => {
      this.table.columns.fields().forEach(col => {
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
      this.table.joins.forEach(join => {
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
      return Promise.all(this.table.columns.fields().map(col => {
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
        return Promise.all(this.table.joins.map(join => {
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
