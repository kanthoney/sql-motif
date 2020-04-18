'use strict';

const _ = require('lodash');
const TypeExpander = require('./type-expander');
const Column = require('./column');
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

  fields(selector)
  {
    return this.columns.reduce((acc, col) => {
      if(col instanceof ColumnSet) {
        if(col.passesSelection(selector)) {
          return acc.concat(col.fields());
        }
        return acc.concat(col.fields(selector));
      } else if(col instanceof Column) {
        if(col.passesSelection(selector)) {
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
        return acc.concat(col.values(record, options, all));
      } else if(col instanceof Column) {
        if(!options.selector || col.passesSelection(options.selector)) {
          const path = col.path || col.alias || col.name;
          let value = _.get(record, path);
          if(value !== undefined || all) {
            return acc.concat({ col, value });
          }
        }
        if((options.safe || options.fullSafe) && col.primaryKey) {
          throw new SafetyError;
        }
      }
      return acc;
    }, []);
  }

  validate(record)
  {
    if(_.isArray(record)) {
      return record.map(record => this.validate(record));
    }
    return this.columns.reduce((acc, col) => {
      const validation = col.isValid(record);
      if(validation.error) {
        _.set(acc.errors, validation.path, validation.error);
        acc.valid = false;
      }
      return acc;
    }, { record, valid: true, errors: {} });
  }

  fill(record, context)
  {
    return this.columns.reduce((acc, col) => {
      return col.fill(acc, context);
    }, record);
  }

};

module.exports = ColumnSet;
