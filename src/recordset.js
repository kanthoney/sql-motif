'use strict';

const _ = require('lodash');
const Record = require('./record');

class RecordSet
{
  constructor(table, joined)
  {
    this.table = table;
    this.joined = joined;
    this.records= [];
    this.recordMap = {};
  }

  addSQLResult(line)
  {
    if(_.isArray(line)) {
      return line.map(line => this.addSQLResult(line));
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
    let record = new Record(this, recordData);
    const hash = record.hashKey();
    if(!empty) {
      if(this.recordMap[hash] === undefined) {
        this.records.push(record);
        this.recordMap[hash] = record;
      } else {
        record = this.recordMap[hash];
      }
      this.table.joins.forEach(join => {
        let recordSet = _.get(record.data, join.path || join.name);
        if(recordSet === undefined) {
          recordSet = new RecordSet(join.table, Object.assign({}, _.get(joined, join.table.config.path), _.get(this.joined, join.path || join.name)));
          _.set(record.data, join.path || join.name, recordSet);
        }
        recordSet.addSQLResult(line);
      });
    }
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
  }

  validateRecord(context)
  {
    return this.records.reduce((acc, record) => {
      const result = this.table.joins.reduce((acc, join) => {
        const path = join.path || join.name;
        const subRecord = _.get(record.data, path);
        if(subRecord instanceof RecordSet) {
          const result = subRecord.validateRecord(context);
          const { records, errors } = result.results.reduce((acc, result) => {
            acc.records.push(result.record);
            acc.errors.push(result.errors);
            return acc;
          }, { records: [], errors: [] });
          _.set(acc.record, path, records);
          if(!result.valid) {
            acc.valid = false;
            _.set(acc.errors, path, errors);
          }
        }
        return acc;
      }, this.table.columns.values(record.data, null, true).reduce((acc, field) => {
        let { col, value } = field;
        const path = col.path;
        if(value !== undefined) {
          _.set(acc.record, path, value);
        }
        const joinedValue = _.get(this.joined, path);
        if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
          _.set(acc.errors, path, `join mismatch. Parent: '${joinedValue}', child: '${value}'`);
          acc.valid = false;
          return acc;
        }
        if(value === undefined) {
          value = joinedValue;
          _.set(acc.record, path, value);
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
      }, { record: {}, valid: true, errors: {} }));
      if(!result.valid) {
        acc.valid = false;
      }
      acc.results.push(result);
      return acc;
    }, { results: [], valid: true });
  }

  validateRecordAsync(context)
  {
    return Promise.all(this.records.map(record => {
      let a = this.table.columns.values(record.data, null, true).map(field => {
        let { col, value } = field;
        const path = col.path;
        let joinedValue = _.get(this.joined, path);
        if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
          return { path, value, error: `join mismatch. Parent: '${joinedValue}', child: '${value}'` };
        }
        if(value === undefined) {
          value = joinedValue;
        }
        if(col.notNull && _.isNil(value)) {
          return { path, value, error: col.validationError || 'Field must not be null' };
        }
        if(!col.notNull && value === null) {
          return { path, value };
        }
        if(col.validate) {
          const validate = v => {
            if(_.isString(v)) {
              if(`${value}` !== v) {
                return { path, value, error: col.validationError || 'Field is not valid' };
              }
              return { path, value };
            }
            if(_.isRegExp(v)) {
              if(!v.test(value)) {
                return { path, value, error: col.validationError || `Field did not conform to regular expression '${v.toString()}'` }
              }
              return { path, value };
            }
            if(_.isFunction(v)) {
              try {
                return Promise.resolve(v(value, col, context)).then(result => {
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
        const recordSet = _.get(record.data, path);
        if(recordSet instanceof RecordSet) {
          return acc.concat(recordSet.validateRecordAsync(context).then(result => {
            return { path, value: result.results, valid: result.valid, isSubrecord: true }
          }));
        }
        return acc;
      }, []));
      return Promise.all(a).then(result => {
        return result.reduce((acc, result) => {
          if(result.isSubrecord) {
            const { records, errors } = result.value.reduce((acc, result) => {
              acc.records.push(result.record);
              acc.errors.push(result.errors);
              return acc;
            }, { records: [], errors: [] });
            _.set(acc.record, result.path, records);
            if(!result.valid) {
              acc.valid = false;
              _.set(acc.errors, result.path, errors);
            }
          } else {
            if(result.error) {
              acc.valid = false;
              _.set(acc.errors, result.path, result.error);
            }
            if(result.value !== undefined) {
              _.set(acc.record, result.path, result.value);
            }
          }
          return acc;
        }, { record: {}, valid: true, errors: {} });
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

  toObject(options)
  {
    return this.records.map(record => record.toObject(options));
  }

  toJSON()
  {
    return JSON.stringify(this.toObject());
  }
};

module.exports = RecordSet;
