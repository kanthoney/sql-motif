'use strict';

const _ = require('lodash');
const Selector = require('./selector');

class Column
{
  constructor(config)
  {
    this.config = config || {};
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
    this.joinedToFull = [];
  }

  passesSelection(selector)
  {
    if(!(selector instanceof Selector)) {
      return this.passesSelection(new Selector(selector));
    }
    return selector.passes(this);
  }

  SQL(as, context = {})
  {
    if(_.isString(this.calc)) {
      return as?`${this.calc} as ${this.table.dialect.escapeId(this.fullAlias)}`:this.calc;
    } else if(_.isFunction(this.calc)) {
      return as?`${this.calc({ table: this.table, sql: this.table.dialect.template(context), context })} as ${this.table.dialect.escapeId(this.fullAlias)}`:
      this.calc({ table: this.table, sql: this.table.dialect.template(context), context });
    }
    return as?this.sql.fullNameAs:this.sql.fullName;
  }

}

module.exports = Column;
