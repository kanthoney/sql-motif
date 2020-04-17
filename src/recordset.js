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

  addRecord(record)
  {
    if(_.isArray(record)) {
      return record.forEach(record => this.addRecord(record));
    }
    const recordData = this.table.columms.fields().reduce((acc, col) => {
      const path = col.path || col.alias || col.name;
      const value = _.get(record, path);
      if(value !== undefined) {
        _.set(acc, path);
      }
      return acc;
    }, {});
    let r = new Record(this, recordData);
    const hash = r.hashKey();
    this.records.push(r);
    this.recordMap[hash] = r;
    this.tableJoins.forEach(join => {
      const value = _.get(record, join.path || join.name);
      if(value !== undefined) {
        let recordSet = _.get(record.data, join.path || join.name);
        if(recordSet === undefined) {
          recordSet = new RecordSet(join.table, r);
        }
        recordSet.addRecord(value);
      }
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

  validateRecord(context)
  {
    return this.records.reduce((acc, record) => {
      return this.table.joins.reduce((acc, join) => {
        const path = join.path || join.name;
        const subRecord = _.get(record, path);
        if(subRecord instanceof RecordSet) {
          const result = subRecord.validateRecord(context);
          if(!result.valid) {
            acc.valid = false;
          }
          _.set(acc.errors, path, result.errors);
          _.set(acc.record, path, result.record);
        }
        return acc;
      }, this.table.columns.values(record).reduce((acc, field) => {
        const { col, value } = field.col;
        const path = col.path || col.alias || col.name;
        if(value !== undefined) {
          _.set(acc.record, path, value);
        }
        if(col.notNull && _.isNil(value)) {
          if(!_.has(acc.errors, path)) {
            _.set(acc.errors, path, col.validationError || 'Field must not be null');
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
                const result = v(value, col, record, context);
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
      }, { record: {}, valid: true, errors: {} }));
      if(!valid) {
        acc.valid = false;
      }
      acc.results.push({ record, valid, errors });
      return acc;
    }, { results: [], valid: true });
  }

  validateRecordAsync(context)
  {
    return Promise.all(this.records, record => {
      return Promise.all(this.table.columns.values(record).map(field => {
        const { col, value } = field;
        const path = col.path || col.alias || col.name;
        if(col.notNull && _.isNil(value)) {
          return { path, value, errors: col.validationError || 'Field must not be null' };
        }
        if(!col.notNull && value === null) {
          return null;
        }
        if(col.validate) {
          const validate = v => {
            if(_.isString(v)) {
              if(`${value}` !== v) {
                return { path, error: col.validationError || 'Field is not valid' };
              }
              return { path, value };
            }
            if(_.isRegExp(v)) {
              if(!v.test(value)) {
                return { path, error: col.validationError || `Field did not conform to regular expression '${v.toString()}'` }
              }
              return { path, value };
            }
            if(_.isFunction(v)) {
              try {
                return Promise.resolve(v(value, col, record, context)).then(result => {
                  if(result === true) {
                    return { path, value };
                  }
                  return { path, value, error: result || col.validationError || 'Field failed function validation' }
                }).catch(error => {
                  return { path, value, error: (error instanceof Error?error.message:error) || col.validationError || 'Field failed function validation' };
                });
              } catch(error) {
                return { path, value, error: (error instanceof Error?error.message:error) || col.validationError || 'Field failed function validation' };
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
                }, { path, value, error: col.validationError || 'Field did not match any validator' });
              });
            }
            return { path, value };
          }
          return validate(col.validate);
        }
        return { path, value };
      }).concat(this.table.joins.reduce((acc, join) => {
        const path = join.path || join.name;
        const recordSet = _.get(record, path);
        if(recordSet instanceof RecordSet) {
          return acc.concat(recordSet.validateRecordsAsync(context).then(result => {
            return { path, value: result.results, valid: result.valid, isSubrecord: true }
          }));
        }
        return acc;
      }, [])).then(result => {
        return result.reduce((acc, result) => {
          if(result.isSubrecord) {
            if(!result.valid) {
              acc.valid = false;
            }
          } else if(result.error) {
            acc.valid = false;
            _.set(acc.errors, path, result.error);
          }
          if(result.value !== undefined) {
            _.set(acc.record, result.path, result.value);
          }
          return acc;
        }, { record: {}, valid: true, errors: {} });
      }));
    }).then(result => {
      return result.reduce((acc, result) => {
        if(!result.valid) {
          acc.valid = false;
        }
        acc.results.concat(result);
        return acc;
      }, { results, valid: true });
    });
  }

  fill(context)
  {
    return this.records.map(record => {
      return this.table.joins.reduce((acc, join) => {
        const path = join.path || join.name;
        const subRecord = _.get(record, join.path || join.name);
        if(subRecord instanceof RecordSet) {
          _.set(acc, path, sub.fill(context));
        }
        return acc;
      }, this.table.columns.fields().reduce((acc, col) => {
        const path = col.path || col.alias || col.name;
        let value = _.get(record, path);
        if(col.default && (value === undefined || (col.notNull && value === null))) {
          if(_.isFunction(col.default)) {
            value = col.default(col, context);
          } else {
            value = col.default;
          }
        }
        _.set(record.data, path, value);
        _.set(acc, path, value);
        return acc;
      }, {}));
    });
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
