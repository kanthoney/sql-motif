'use strict';

const _ = require('lodash');

module.exports = class Selector
{
  constructor(selector, base)
  {
    if(selector instanceof Selector) {
      this.selector = selector.selector;
      if(base) {
        if(selector.base) {
          this.base = `${selector.base}_${base}`;
        } else {
          this.base = base;
        }
      } else {
        this.base = selector.base;
      }
    } else {
      if(_.isArray(selector)) {
        this.selector = selector.map(selector => new Selector(selector, base));
      } else if(base && _.isString(selector)) {
        this.selector = `${base}_${selector}`;
      } else {
        this.selector = selector;
      }
      this.base = base || '';
    }
  }

  passes(col)
  {
    const Column = require('./column');
    const ColumnSet = require('./column-set');
    const Table = require('./table');
    if(col instanceof Column) {
      const alias = col.table.config.path.concat(col.alias).join('_');
      if((!col.hidden && (this.selector === undefined || this.selector === '*' || this.selector === true ||
                          (_.isRegExp(this.selector) && this.selector.test(alias)))) ||
         (_.isFunction(this.selector) && this.selector(col))) {
        return true;
      }
      if(_.isString(this.selector)) {
        if(this.selector === alias) {
          return true;
        }
        let m = /^([\.@])(.*)/.exec(this.selector);
        if(m) {
          if(m[1] === '@' && m[2] === (col.table.config.alias || col.table.config.name) && !col.hidden) {
            return true;
          }
          if(m[1] === '.' && col.tags) {
            if(col.tags.split(/\s+/g).includes(m[2])) {
              return true;
            }
          }
        }
      }
      if(_.isArray(this.selector)) {
        return this.selector.reduce((acc, s) => acc || s.passes(col), false);
      }
      if(_.isPlainObject(this.selector) && _.get(this.selector, col.alias || col.name)) {
        return true;
      }
    } else if(col instanceof ColumnSet) {
      if(!col.config.hidden && (this.selector === undefined || this.selector === '*' || this.selector === true)) {
        return new Selector('*');
      } else if(_.isArray(this.selector)) {
        return this.selector.map(s => s.passes(col));
      } else if(_.isString(this.selector)) {
        const m = /^([\.@])(.+)/.exec(this.selector);
        if(m) {
          if(!col.config.hidden && m[1] === '@') {
            if((col.config.table.config.alias || col.config.table.config.name) === m[2]) {
              return new Selector('*');
            } else {
              return this;
            }
          }
          if(!col.config.hidden && m[1] === '.') {
            if(col.config.tags && col.config.tags.split(/\s+/g).includes(m[2])) {
              return new Selector('*');
            } else {
              return this;
            }
          }
        }
        
        if(this.selector === (col.config.alias || col.config.name)) {
          return '*';
        }
        return this;
      } else if(_.isPlainObject(this.selector)) {
        const newSelector = _.get(this.selector, col.config.alias || col.config.name);
        if(newSelector !== undefined) {
          return new Selector(newSelector, this.base?`${this.base}_${col.config.alias || col.config.name}`:(col.config.alias || col.config.name));
        }
      } else {
        return this;
      }
    }
    return false;
  }

  passesJoin(join)
  {
    if(_.isArray(this.selector)) {
      return this.selector.reduce((acc, s) => {
        if(_.isArray(acc)) {
          if(s.selector === `@${join.alias || join.name}`) {
            return new Selector('*');
          }
          const newSelector = s.passesJoin(join);
          if(newSelector) {
            return acc.concat(newSelector);
          }
        }
        return acc;
      }, []);
    } else if(_.isPlainObject(this.selector)) {
      const newSelector = _.get(this.selector, join.alias || join.name);
      if(newSelector) {
        return new Selector(newSelector, join.alias || join.name);
      }
      return false;
    } else if(_.isString(this.selector)) {
      if(this.base) {
        if(`${this.base}_${join.alias || join.name}` === this.selector) {
          return new Selector(true);
        }
      } else {
        if(this.selector === join.alias || join.name) {
          return new Selector(true);
        }
      }
    }
    return this;
  }

}

