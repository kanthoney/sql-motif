'use strict';

const _ = require('lodash');
const TypeExpander = require('./type-expander');
const Column = require('./column');
const RecordSet = require('./recordset');
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

  values(record, options, all)
  {
    options = options || {};
    return this.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        const value = _.get(record, col.config.path);
        if(_.isArray(value)) {
          return acc.concat({ col, value });
        }
        return acc.concat(col.values(record, options, all));
      } else if(col instanceof Column) {
        if(!options.selector || col.passesSelection(options.selector)) {
          let value = _.get(record, col.path);
          if(value !== undefined || all) {
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

  whereArray(record, options)
  {
    const table = this.config.table;
    if(record instanceof RecordSet) {
      return this.whereArray(record.toObject({ includeJoined: true }));
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
        const w = this.whereArray(record, options);
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
        if(!_.isArray(value)) {
          value = [value];
        }
        return acc.concat(col.whereArray(value.map(value => _.set({}, col.config.path, value)), { ...options, brackets: true }));
      }
      if(options.safe) {
        if(!_.isNil(value) || _.get(options.joined, col.path)) {
          col.joinedTo.forEach(path => {
            _.set(options.joined, path, true);
          });
        }
      }
      if(value instanceof Operator) {
        return acc.concat(value.clause(table.dialect, col));
      } else if(value instanceof Function) {
        return acc.concat(`${col.SQL()} = ${table.escape(value(col, this.dialect.template))}`);
      }
      return acc.concat(operators.eq(value).clause(table.dialect, col));
    }, []).concat(table.joins.reduce((acc, join) => {
      if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
        return acc;
      }
      const subRecord = _.get(record, join.path || join.name);
      const where = join.table.where(subRecord || {}, {
        ...options,
        joined: _.get(options.joined, join.path || join.name),
        needed: _.get(options.needed, join.path || join.name),
        safe: options.safe && !join.readOnly,
        brackets: _.isArray(subRecord)
      });
      if(!where) {
        return acc;
      }
      return acc.concat(where);
    }, []));
  }


};

module.exports = ColumnSet;
