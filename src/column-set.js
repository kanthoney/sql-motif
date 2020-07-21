'use strict';

const _ = require('lodash');
const TypeExpander = require('./type-expander');
const Column = require('./column');
const RecordSet = require('./recordset');
const Record = require('./record');
const Operator = require('./operator');
const operators = require('./operators');
const SafetyError = require('./safety-error');
const Selector = require('./selector');

class ColumnSet
{
  constructor(config)
  {
    this.config = _.defaults(config, {
      path: [],
      columns: []
    });
  }

  concat(cols)
  {
    return new ColumnSet({
      ...this.config,
      columns: this.config.columns.concat(cols),
    });
  }

  reTable(table)
  {
    return new ColumnSet({
      ...this.config,
      table,
      columns: this.config.columns.map(col => {
        if(col instanceof Column) {
          return new Column({
              ...col,
            table });
        } else if(col instanceof ColumnSet) {
          return col.reTable(table);
        }
      }),
    });
  }

  subTable(selector, table, joins, primaryTable, path = [])
  {
    if(!(selector instanceof Selector)) {
      return this.subTable(new Selector(selector), table, joins, primaryTable, path);
    }
    if(!_.isArray(path)) {
      path = [path];
    }
    let columns = this.config.columns.reduce((acc, col) => {
      if(col instanceof Column) {
        if(selector.passes(col)) {
          return acc.concat(new Column({
              ..._.omit(col.config, 'calc'),
            primaryKey: primaryTable && col.primaryKey,
            table,
            name: path.concat(col.alias || col.name).join('_'),
            subTablePath: col.subTablePath || col.table.config.path,
            subTableColPath: col.subTableColPath || col.table.config.path.concat(col.path),
            subTableJoinedTo: col.subTableJoinedTo || col.joinedTo
          }));
        }
      } else if(col instanceof ColumnSet) {
        const newSelector = selector.passes(col);
        if(newSelector !== false) {
          const columnSet = col.subTable(newSelector, table, false, primaryTable, path);
          if(columnSet.config.columns.length === 0) {
            return acc;
          }
          return acc.concat(columnSet);
        }
      }
      return acc;
    }, []);
    if(joins) {
      columns = columns.concat(this.config.table.joins.reduce((acc, join) => {
        const newSelector = selector.passesJoin(join);
        if(newSelector !== false) {
          return acc.concat(join.table.columns.subTable(newSelector, table, true, false, path.concat(join.path || join.name)));
        }
        return acc;
      }, []));
    }
    return new ColumnSet({
      ...this.config,
      table,
      columns,
      path: path.concat(this.config.path)
    });
  }

  passesSelection(selector)
  {
    if(!(selector instanceof Selector)) {
      return this.passesSelection(new Selector(selector));
    }
    return selector.passes(this);
  }

  fields(selector, all)
  {
    if(!(selector instanceof Selector)) {
      return this.fields(new Selector(selector), all);
    }
    return this.config.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        if(all) {
          return acc.concat(col.fields(new Selector('*'), all));
        }
        const newSelector = selector.passes(col);
        if(newSelector !== false) {
          return acc.concat(col.fields(newSelector));
        }
      } else if(col instanceof Column) {
        if(all || selector.passes(col)) {
          return acc.concat(col);
        }
      }
      return acc;
    }, []);
  }

  fieldFromName(name)
  {
    return this.config.columns.reduce((acc, col) => {
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
    return this.config.columns.reduce((acc, col) => {
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
    return this.config.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        const value = _.get(record, col.config.path);
        return acc.concat({ col, value });
      } else if(col instanceof Column) {
        const path = col.subTableColPath || col.path;
        if(!options.selector || col.passesSelection(options.selector)) {
          const value = _.get(record, path);
          if(value !== undefined) {
            return acc.concat({ col, value });
          }
        }
        if(options.safe && col.primaryKey && _.get(options.joined, col.path) === undefined) {
          throw new SafetyError(col);
        }
      }
      return acc;
    }, []);
  }

  validateRecord(record, options = {})
  {
    let { context, selector, ignoreMissing, ignoreMissingNonKey } = options;
    return this.config.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          const value = _.get(record.data, col.config.path);
          context = col.context(value, context);
        } else {
          context = { ...context, ...col.context };
        }
        let result = col.validateRecord(record, { ...options, context, selector: col.passesSelection(selector) });
        if(!result.valid) {
          acc.valid = false;
        }
        Object.assign(acc, result.errors);
        return acc;
      }
      if(!col.passesSelection(selector)) {
        return acc;
      }
      if(col.calc) {
        return acc;
      }
      const path = col.subTablePath || col.path;
      let value = _.get(record.data, path);
      const joinedValue = record.getJoined(path);
      if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
        _.set(acc.errors, path, `join mismatch. Parent: '${joinedValue}', child: '${value}'`);
        acc.valid = false;
        return acc;
      }
      if(value === undefined) {
        value = joinedValue;
      }
      if(col.notNull && _.isNil(value)) {
        if(value === undefined && (ignoreMissing || (!col.primaryKey && ignoreMissingNonKey))) {
          return acc;
        }
        if(!_.has(acc.errors, path)) {
          _.set(acc.errors, path, col.validationError || 'Field must not be null');
          acc.valid = false;
        }
        return acc;
      } else if(!col.notNull && _.isNil(value)) {
        return acc;
      }
      if(col.validate) {
        if(_.isFunction(col.context)) {
          context = col.context({ value, context });
        } else if(col.context) {
          context = { ...col.context, ...context };
        }
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
              const result = v({ value, context, col });
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

  validateAsync(record, options = {})
  {
    let { context, selector, ignoreMissing, ignoreMissingNonKey } = options;
    return Promise.all(this.config.columns.map(col => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          context = col.context({ value: _.get(record.data, col.config.path), context });
        } else {
          context = { ...context, ...col.context };
        }
        const newSelector = col.passesSelection(selector);
        if(newSelector) {
          return Promise.resolve(context).then(context => col.validateAsync(record, { ...options, context, selector: newSelector }));
        }
        return null;
      }
      if(!col.passesSelection(selector)) {
        return null;
      }
      let value = _.get(record.data, col.path);
      if(col.calc) {
        return null;
      }
      const path = col.path;
      let joinedValue = record.getJoined(path);
      if(!_.isNil(joinedValue) && !_.isNil(value) && joinedValue !== value) {
        return acc.concat({ path, error: `join mismatch. Parent: '${joinedValue}', child: '${value}'` });
      }
      if(value === undefined) {
        value = joinedValue;
      }
      if(col.notNull && _.isNil(value)) {
        if(value === undefined && (ignoreMissing || (!col.primaryKey && ignoreMissingNonKey))) {
          return null;
        }
        return { path, error: col.validationError || 'Field must not be null' };
      }
      if(!col.notNull && value === null) {
        return null;
      }
      if(col.validate) {
        if(_.isFunction(col.context)) {
          context = col.context({ value, context });
        } else if(col.context) {
          context = { ...col.context, ...context };
        }
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
                const result = await v({ value, context, col });
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

  fill(record, options = {})
  {
    let { context, selector } = options;
    this.config.columns.forEach(col => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          let value = _.get(record.data, col.config.path);
          context = col.context({ value, context });
        } else if(col.context) {
          context = { ...col.context, ...context };
        }
        const newSelector = col.passesSelection(selector);
        if(newSelector) {
          return col.fill(record, { ...options, context, selector: newSelector });
        }
        return;
      }
      if(!col.passesSelection(selector)) {
        return;
      }
      const path = col.path;
      let value = _.get(record.data, path);
      if(value === undefined) {
        value = record.getJoined(path);
      }
      if(col.default !== undefined && (value === undefined || (col.notNull && value === null))) {
        if(_.isFunction(col.context)) {
          context = col.context({ value, context });
        } else if(col.context) {
          context = { ...col.context, ...context };
        }
        if(_.isFunction(col.default)) {
          value = col.default({ context, col });
        } else {
          value = col.default;
        }
        record.set(col, value);
      }
    });
  }

  fillAsync(record, options = {})
  {
    let { context, selector } = options;
    return Promise.all(this.config.columns.map(col => {
      if(col instanceof ColumnSet) {
        if(_.isFunction(col.context)) {
          context = col.context({ value: _.get(record.data, col.config.path), context });
        } else {
          context = { ...context, ...col.context };
        }
        const newSelector = col.passesSelection(selector);
        if(newSelector) {
          return Promise.resolve(context).then(context => col.fillAsync(record, { ...options, context, selector: newSelector }));
        }
        return null;
      }
      const path = col.path;
      let value = _.get(record.data, path);
      const joinedValue = record.getJoined(path);
      if(value === undefined || (col.notNull && value === null)) {
        if(!_.isNil(joinedValue)) {
          value = joinedValue;
          record.set(col, value);
        } else {
          if(_.isFunction(col.context)) {
            context = col.context({ value, context });
          } else if(col.context) {
            context = { ...col.context, ...context };
          }
          return Promise.resolve(context).then(context => {
            if(_.isFunction(col.default)) {
              return new Promise(resolve => {
                resolve(col.default({ context, col }));
              }).then(value => {
                record.set(col, value);
              });
            } else {
              record.set(col, col.default);
            }
          });
        }
      }
    }));
  }

  defaults(record, defaults = {})
  {
    return this.fields().forEach(col => {
      if(col instanceof ColumnSet) {
        return col.defaults(record, defaults);
      }
      if(col.calc) {
        return;
      }
      const path = col.subTableColPath || col.path;
      let value = _.get(record.data, path);
      if(value === undefined) {
        record.set(col, _.get(defaults, path));
        const joined = col.joinedTo.concat(col.subTableJoinedTo || []).reduce((acc, path) => {
          _.set(acc, path, value);
          return acc;
        }, {});
        if(col.table.config.path.length === 0) {
          _.merge(defaults, joined);
        } else {
          _.merge(defaults, _.get(joined, col.table.config.path));
        }
      }
    });
  }

  scope(record, scope = {}, defaults = {})
  {
    return this.fields().forEach(col => {
      if(col instanceof ColumnSet) {
        return col.scope(record, scope);
      }
      if(col.calc) {
        return;
      }
      const path = col.subTableColPath || col.path;
      let value = _.get(scope, path);
      if(value !== undefined) {
        record.set(col, value);
        const joined = col.joinedTo.concat(col.subTableJoinedTo || []).reduce((acc, path) => {
          _.set(acc, path, value);
          return acc;
        }, {});
        if(col.table.config.path.length === 0) {
          _.merge(scope, joined);
        } else {
          _.merge(scope, _.get(joined, col.table.config.path));
        }
      } else if(_.get(record.data, path) === undefined) {
        value = _.get(defaults, path);
        if(value !== undefined) {
          record.set(col, value);
          const joined = col.joinedTo.concat(col.subTableJoinedTo || []).reduce((acc, path) => {
            _.set(acc, path, value);
            return acc;
          }, {});
          if(col.table.config.path.length === 0) {
            _.merge(defaults, joined);
          } else {
            _.merge(defaults, _.get(joined, col.table.config.path));
          }
        }
      }
    });
  }

  key(record)
  {
    return this.fields().reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        Object.assign(acc, col.key(record));
      } else if(col.primaryKey) {
        _.set(acc, col.path, _.get(record.data, col.path));
      }
      return acc;
    }, {});
  }

  keyScope(record, scope)
  {
    return this.fields().reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        Object.assign(acc, col.keyScope(record, scope));
      } else if(col.primaryKey) {
        const path = col.subTableColPath || col.path;
        let value = _.get(scope, path);
        if(value === undefined) {
          value = _.get(record.data, path);
        }
        if(value !== undefined) {
          _.set(acc, path, value);
          const joined = col.joinedTo.concat(this.subTableJoinedTo || []).reduce((acc, path) => {
            _.set(acc, path, value);
            return acc;
          }, {});
          if(col.table.config.path.length === 0) {
            return _.merge(acc, joined);
          }
          return _.merge(acc, _.get(joined, col.table.config.path));
        }
      }
      return acc;
    }, {});
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
        value = record.getJoined(path);
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
        return acc.concat(`${value.clause(dialect, col, options.context || {})}`);
      } else if(value instanceof Function) {
        return acc.concat(`${fullName} = ${dialect.escape(value({ table, col, sql: dialect.template(options.context), context: options.context || {} }))}`);
      }
      return acc.concat(`${fullName} = ${dialect.escape(value, options.context)}`);
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
            _.set(options.joined, path, value);
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
          return value.clause(table.dialect, col, options.context || {});
        } else if(value instanceof Function) {
          return `${col.SQL(false, options.context || {})} = ${table.escape(value({ table, col, sql: table.dialect.template(options.context), context: options.context || {} }))}`;
        }
        return operators.eq(value).clause(table.dialect, col, options.context || {});
      }
      return acc.concat(clause(value));
    }, []);
  }

  SQL(as, context = {})
  {
    return this.config.columns.map(col => col.SQL(as, context)).join(', ');
  }

  toJSON()
  {
    return {
      path: this.config.path,
      columns: this.config.columns.map(col => {
        if(col instanceof ColumnSet) {
          return col.toJSON();
        }
        return col.config.name;
      })
    }
  }

};

module.exports = ColumnSet;
