'use strict';

const _ = require('lodash');

class Column
{
  constructor(config)
  {
    Object.assign(this, config || {});
    this.alias = this.alias || this.name;
    this.path = this.path || this.alias;
    const name = this.table.dialect.escapeId(this.name);
    const fullName = `${this.table.as()}.${name}`;
    this.fullAlias = this.table.config.path.concat(this.alias).join('_');
    this.sql = {
      name,
      fullName,
      fullNameAs: fullName + (this.fullAlias !== this.name?` as ${this.table.dialect.escapeId(this.fullAlias)}`:''),
      as: this.fullAlias?this.table.dialect.escapeId(this.fullAlias):fullName
    }
    this.joinedTo = [];
  }

  passesSelection(selector)
  {
    const alias = this.table.config.path.concat(this.alias).join('_');
    if(selector === undefined || selector === '*' ||
        (_.isRegExp(selector) && selector.test(alias) ||
        (_.isFunction(selector) && selector(this)))) {
      return true;
    }
    if(_.isString(selector)) {
      if(selector === alias) {
        return true;
      }
      let m = /^([\.@])(.*)/.exec(selector);
      if(m) {
        if(m[1] === '@' && m[2] === (this.table.config.alias || this.table.config.name)) {
          return true;
        }
        if(m[1] === '.' && this.selector) {
          if(m[2] === this.selector || (_.isArray(this.selector) && this.selector.includes(m[2]))) {
            return true;
          }
        }
      }
      return false;
    }
    if(_.isArray(selector)) {
      return selector.reduce((acc, s) => acc || this.passesSelection(s), false);
    }
    return false;
  }

  isValid(record)
  {
    const path = this.path;
    const value = _.get(record, path);
    if(this.notNull && _.isNil(value)) {
      return { path, error: `Field must not be null` };
    }
    const validate = validator => {
      if(_.isRegExp(validator) && !validator.test(value)) {
        return { path, error: this.validateError || `Failed regular expression '${validate.toString()}'` };
      } else if(_.isFunction(validator)) {
        const result = validator(value, this, record);
        if(result === true) {
          return {};
      }  else if(_.isString(result)) {
          return { path, error: result };
        }
        return { path, error: this.validationError || 'Field failed function validation' };
      }
      if(_.isString(validator)) {
        if(validator !== value && !_.isNil(value)) {
          return { path, error: this.validationError || 'Field failed string validation' };
        }
        return {};
      }
      if(_.isArray(validator)) {
        if(!validator.reduce((acc, validator) => {
          if(acc) {
            return true;
          }
          if(validate(validator).path) {
            return false;
          }
        }, false)) {
          return { path, error: this.validationError || 'Field failed validation' };
        }
      }
      return {};
    }
    return validate(this.validate);
  }

  fill(record, context)
  {
    const value = _.get(record, this.path);
    if(value === undefined && this.default !== undefined) {
      if(_.isFunction(this.default)) {
        _.set(record, this.path, this.default(col, context));
      } else {
        _.set(record, this.path, this.default);
      }
    }
    return record;
  }

}

module.exports = Column;
