'use strict';

const _ = require('lodash');
const TypeExpander = require('./type-expander');
const Column = require('./column');
const RecordSet = require('./recordset');
const Record = require('./record');
const Operator = require('./operator');
const operators = require('./operators');
const SafetyError = require('./safety-error');

class ColumnSet
{
  constructor(config)
  {
    this.config = _.defaults(config, {
      path: [],
      columns: []
    });
    const typeExpander = new TypeExpander(this.config.types);
    this.columns = config.columns.map(col => {
      return typeExpander.expand({
        ...col,
        table: this.config.table
      });
    });
  }

  passesSelection(selector)
  {
    if(!this.config.hidden && (selector === undefined || selector === '*')) {
      return true;
    } else if(_.isArray(selector)) {
      return selector.reduce((acc, selector) => acc || this.passesSelection(selector), false);
    } else if(_.isString(selector)) {
      const m = /^([\.@])(.+)/.exec(selector);
      if(m) {
        if(!this.config.hidden && m[1] === '@' && (this.config.table.config.alias || this.config.table.config.name) === m[2]) {
          return true;
        }
        if(!this.config.hidden && m[1] === '.' && this.config.tags && this.config.tags.split(/\s+/g).includes(m[2])) {
          return true;
        }
      }
      return selector === (this.config.alias || this.config.name);
    }
    return false;
  }

  fields(selector, all)
  {
    return this.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        if(all || col.passesSelection(selector)) {
          return acc.concat(col.fields('*', all));
        }
        return acc.concat(col.fields(selector));
      } else if(col instanceof Column) {
        if(all || col.passesSelection(selector)) {
          return acc.concat(col);
        }
      }
      return acc;
    }, []);
  }

  fieldFromName(name)
  {
    return this.columns.reduce((acc, col) => {
      if(!acc) {
        if(col instanceof ColumnSet) {
          return col.fieldFromName(name);
        }
        if(col.name === name) {
          return col;
        }
      }
      return acc;
    }, null);
  }

  fieldFromAlias(name)
  {
    return this.columns.reduce((acc, col) => {
      if(!acc) {
        if(col instanceof ColumnSet) {
          return col.fieldFromAlias(name);
        }
        const alias = col.table.config.path.concat(col.alias || col.name).join('_');
        if(alias === name) {
          return col;
        }
      }
      return acc;
    }, null);
  }

  values(record, options)
  {
    options = options || {};
    return this.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        const value = _.get(record, col.config.path);
        return acc.concat({ col, value });
      } else if(col instanceof Column) {
        if(!options.selector || col.passesSelection(options.selector)) {
          let value = _.get(record, col.path);
          if(value !== undefined) {
            return acc.concat({ col, value });
          }
        }
        if(options.safe && col.primaryKey && !_.get(options.joined, col.path)) {
          throw new SafetyError(col);
        }
      }
      return acc;
    }, []);
  }

  validateRecord(record, context)
  {
    return this.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          const value = _.get(record.data, col.config.path);
          context = col.context(value, context);
        } else {
          context = { ...context, ...col.context };
        }
        let result = col.validateRecord(record, context);
        if(!result.valid) {
          acc.valid = false;
        }
        Object.assign(acc, result.errors);
        return acc;
      }
      if(col.calc) {
        return acc;
      }
      const path = col.path;
      let value = _.get(record.data, path);
      const joinedValue = _.get(record.recordSet.joined, path);
      if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
        _.set(acc.errors, path, `join mismatch. Parent: '${joinedValue}', child: '${value}'`);
        acc.valid = false;
        return acc;
      }
      if(value === undefined) {
        value = joinedValue;
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
      if(_.isFunction(col.context)) {
        context = col.context(value, context);
      } else if(col.context) {
        context = { ...col.context, ...context };
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
    }, record);
  }

  validateAsync(record, context)
  {
    return Promise.all(this.columns.map(col => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          context = col.context(_.get(record.data, col.config.path), context);
        } else {
          context = { ...context, ...col.context };
        }
        return Promise.resolve(context).then(context => col.validateAsync(record, context));
      }
      let value = _.get(record.data, col.path);
      if(col.calc) {
        return null;
      }
      const path = col.path;
      let joinedValue = _.get(record.recordSet.joined, path);
      if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
        return acc.concat({ path, error: `join mismatch. Parent: '${joinedValue}', child: '${value}'` });
      }
      if(value === undefined) {
        value = joinedValue;
      }
      if(col.notNull && _.isNil(value)) {
        return { path, error: col.validationError || 'Field must not be null' };
      }
      if(!col.notNull && value === null) {
        return null;
      }
      if(_.isFunction(col.context)) {
        context = col.context(value, context);
      } else if(col.context) {
        context = { ...col.context, ...context };
      }
      if(col.validate) {
        return Promise.resolve(context).then(context => {
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
          return validate(col.validate);
        });
      }
      return { path, value };
    }));
  }

  fill(record, context)
  {
    this.columns.forEach(col => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          let value = _.get(record.data, col.config.path);
          context = col.context(value, context);
        } else {
          context = { ...context, ...col.context };
        }
        return col.fill(record, context);
      }
      const path = col.path;
      let value = _.get(record.data, path);
      if(value === undefined) {
        value = _.get(record.recordSet.joined, path);
        _.set(record.data, path, value);
      }
      if(_.isFunction(col.context)) {
        context = col.context(value, context);
      } else if(col.context) {
        context = { ...col.context, ...context };
      }
      if(col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
        if(_.isFunction(col.default)) {
          value = col.default(col, context);
        } else {
          value = col.default;
        }
        _.set(record.data, path, value);
        col.joinedTo.forEach(path => {
          _.set(record.recordSet.joined, path, value);
        });
      }
    });
  }

  fillAsync(record, context)
  {
    return Promise.all(this.columns.map(col => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          context = col.context(_.get(record.data, col.config.path), context);
        } else {
          context = { ...context, ...col.context };
        }
        return Promise.resolve(context).then(context => col.fillAsync(record, context));
      }
      const path = col.path;
      let value = _.get(record.data, path);
      if(_.isNil(_.get(record.recordSet.joined, path)) && col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
        if(_.isFunction(col.context)) {
          context = col.context(value, context);
        } else if(col.context) {
          context = { ...col.context, ...context };
        }
        return Promise.resolve(context).then(context => {
          if(_.isFunction(col.default)) {
            return col.default(col, context).then(value => {
              _.set(record.data, path, value);
            });
          }
          value = col.default;
          _.set(record.data, path, value);
          col.joinedTo.forEach(path => {
            _.set(record.recordSet.joined, path, value);
          });
        });
      }
    }));
  }

  scope(record, scope)
  {
    return this.fields().forEach(col => {
      if(col instanceof ColumnSet) {
        return col.scope(record, scope);
      }
      if(col.calc) {
        return;
      }
      let value = _.get(scope, col.path);
      if(value !== undefined) {
        _.set(record.data, col.path, data);
        col.joinedTo.forEach(path => {
          _.set(record.recordSet.joined, col.path, value);
        });
      }
    });
  }

  insertValues(record)
  {
    const dialect = record.table.dialect;
    return this.fields().reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        return acc.concat(col.insertValues(record));
      }
      if(col.calc) {
        return acc;
      }
      const path = col.path;
      let value = _.get(record.data, path);
      if(value === undefined) {
        value = _.get(record.recordSet.joined, path);
      }
      if(value === undefined) {
        return acc.concat(dialect.options.insertDefault || 'default');
      }
      return acc.concat(dialect.escape(value));
    }, []);
  }

  setArray(record, options)
  {
    if(record instanceof RecordSet) {
      return this.setArray(record.toObject({ includeJoined: true }));
    }
    if(record instanceof Record) {
      return this.setArray(record.toObject({ includeJoined: true }));
    }
    options = options || {};
    if(options.joins && options.joins !== '*') {
      if(!_.isArray(options.joins)) {
        options.joins = [options.joins];
      }
    }
    const table = this.config.table;
    const dialect = table.dialect;
    return this.values(record, options).reduce((acc, { col, value }) => {
      if(col instanceof ColumnSet) {
        return acc.concat(col.setArray(_.set({}, col.config.path, value), options));
      }
      if(col.calc) {
        return acc;
      }
      const fullName = dialect.options.singleTableUpdate?col.sql.name:col.sql.fullName;
      if(value instanceof Operator) {
        return acc.concat(`${value.clause(dialect), col}`);
      } else if(value instanceof Function) {
        return acc.concat(`${fullName} = ${dialect.escape(value(col, dialect.template))}`);
      }
      return acc.concat(`${fullName} = ${dialect.escape(value)}`);
    }, []);
  }

  whereArray(record, options)
  {
    const table = this.config.table;
    if(record instanceof RecordSet) {
      return this.whereArray(record.toObject({ includeJoined: true }), options);
    }
    if(record instanceof Record) {
      return this.whereArray(record.toObject({ includeJoined: true }), options);
    }
    options = _.defaults(options || {}, { default: '', joined: {} });
    if(options.joins && options.joins !== '*') {
      if(!_.isArray(options.joins)) {
        options.joins = [options.joins];
      }
    }
    if(_.isArray(record)) {
      if(record.length === 0) {
        return options.default;
      }
      const clauses = record.reduce((acc, record) => {
        const w = this.config.table.whereArray(record, options);
        if(w.length > 1) {
          return acc.concat(`(${w.join(' and ')})`);
        }
        return acc.concat(w);
      }, [])
      if(clauses.length === 0) {
        return [];
      }
      if(clauses.length === 1) {
        return clauses;
      }
      if(options.brackets) {
        return [`(${clauses.join(' or ')})`];
      }
      return [clauses.join(' or ')];
    }
    return this.values(record, options).reduce((acc, { col, value }) => {
      if(col instanceof ColumnSet) {
        if(_.isArray(value)) {
          return acc.concat(col.whereArray(value.map(value => _.set({}, col.config.path, value)), { ...options, brackets: true }));
        }
        return acc.concat(col.whereArray(_.set({}, col.config.path, value), options));
      }
      if(options.safe) {
        if(!_.isNil(value) || _.get(options.joined, col.path)) {
          col.joinedTo.forEach(path => {
            _.set(options.joined, path, true);
          });
        }
      }
      const clause = value => {
        if(_.isArray(value)) {
          if(value.length > 1) {
            return `(${value.map(value => clause(value)).join(' or ')})`;
          }
          return `${value.map(value => clause(value)).join(' or ')}`;
        }
        if(value instanceof Operator) {
          return value.clause(table.dialect, col);
        } else if(value instanceof Function) {
          return `${col.SQL()} = ${table.escape(value(col, this.dialect.template))}`;
        }
        return operators.eq(value).clause(table.dialect, col);
      }
      return acc.concat(clause(value));
    }, []);
  }

};

module.exports = ColumnSet;
