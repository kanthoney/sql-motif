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
    if((!this.hidden && (selector === undefined || selector === '*' ||
        (_.isRegExp(selector) && selector.test(alias)))) ||
        (_.isFunction(selector) && selector(this))) {
      return true;
    }
    if(_.isString(selector)) {
      if(selector === alias) {
        return true;
      }
      let m = /^([\.@])(.*)/.exec(selector);
      if(m) {
        if(m[1] === '@' && m[2] === (this.table.config.alias || this.table.config.name) && !this.hidden) {
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

  SQL(as)
  {
    if(_.isString(this.calc)) {
      return as?`${this.calc} as ${this.table.dialect.escpaeId(this.fullAlias)}`:this.calc;
    } else if(_.isFunction(this.calc)) {
      return as?`${this.calc(this.table, this.table.dialect.template)} as ${this.table.dialect.escapeId(this.fullAlias)}`:this.calc(this.table, this.table.dialect.template);
    }
    return as?this.sql.fullNameAs:this.sql.fullName;
  }

}

module.exports = Column;
