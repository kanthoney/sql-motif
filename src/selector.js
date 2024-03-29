'use strict';

const _ = require('lodash');

module.exports = class Selector
{
  constructor(selector)
  {
    if(selector instanceof Selector) {
      this.selector = selector.selector;
    } else if(_.isArray(selector)) {
      this.selector = selector.map(selector => selector instanceof Selector?selector:new Selector(selector));
    } else {
      this.selector = selector;
    }
  }

  passes(col)
  {
    const Column = require('./column');
    const ColumnSet = require('./column-set');
    const Table = require('./table');
    if(this.selector === false) {
      return false;
    }
    if(col instanceof Column) {
      if((!col.hidden && (this.selector === undefined || this.selector === '*' || this.selector === true ||
                          (_.isRegExp(this.selector) && this.selector.test(col.partName || col.name)))) ||
         (_.isFunction(this.selector) && this.selector(col))) {
        return true;
      }
      if(_.isString(this.selector)) {
        if(this.selector === (col.partName || col.name)) {
          return true;
        }
        let m = /^(![\.@]|[\.@!])(.*)/.exec(this.selector);
        if(m) {
          if(m[1] === '@' && (m[2] === col.table.config.alias || m[2] === col.table.config.name) && !col.hidden) {
            return true;
          }
          if(m[1] === '!@' && m[2] !== col.table.config.alias && m[2] !== col.table.config.name && !col.hidden) {
            return true;
          }
          if(m[1] === '.') {
            if(col.tags && col.tags.split(/\s+/g).includes(m[2])) {
              return true;
            }
          }
          if(m[1] === '!.' && !col.hidden) {
            if(!col.tags || !col.tags.split(/\s+/g).includes(m[2])) {
              return true;
            }
          }
          if(m[1] === '!' && !col.hidden) {
            const cols = m[2].split(',').map(col => col.trim());
            return !cols.includes(col.partName || col.name);
          }
        }
      }
      if(_.isArray(this.selector)) {
        return this.selector.reduce((acc, s) => acc || s.passes(col), false);
      }
      if(_.isPlainObject(this.selector)) {
        return _.get(this.selector, col.partName || col.name);
      }
    } else if(col instanceof ColumnSet) {
      const path = col.config.partName || col.config.name || col.config.path[0];
      if(!col.config.hidden && (this.selector === undefined || this.selector === '*' || this.selector === true)) {
        return new Selector('*');
      } else if(_.isArray(this.selector)) {
        return this.selector.map(s => s.passes(col));
      } else if(_.isString(this.selector)) {
        const m = /^(![\.@]|[\.@!])(.+)/.exec(this.selector);
        if(m) {
          if(!col.config.hidden && m[1] === '@') {
            if(col.config.table.config.alias === m[2] || col.config.table.config.name === m[2]) {
              return new Selector('*');
            } else {
              return this;
            }
          }
          if(!col.config.hidden && m[1] === '!@') {
            if(col.config.table.config.alias === m[2] || col.config.table.config.name === m[2]) {
              return new Selector(false);
            } else {
              return this;
            }
          }
          if(m[1] === '.') {
            if(col.config.tags && col.config.tags.split(/\s+/g).includes(m[2])) {
              return new Selector('*');
            } else {
              return this;
            }
          }
          if(m[1] === '!.') {
            if(col.config.tags && col.config.tags.split(/\s+/g).includes(m[2])) {
              return new Selector(false);
            } else {
              return this;
            }
          }
          if(!col.config.hidden && m[1] === '!') {
            const cols = m[2].split(',').map(col => col.trim());
            if(!cols.includes(path)) {
              return new Selector('*');
            } else {
              return false;
            }
          }
        }
        if(this.selector === (path)) {
          return '*';
        }
      } else if(_.isPlainObject(this.selector)) {
        const newSelector = _.get(this.selector, path);
        if(newSelector !== undefined) {
          return new Selector(newSelector);
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
      const newSelector = this.selector.reduce((acc, s) => {
        if(_.isArray(acc)) {
          if(s.selector === `@${join.alias}` || s.selector === `@${join.name}`) {
            return new Selector('*');
          }
          if(s.selector === `!@${join.alias}` || s.selector === `!@${join.name}`) {
            return false;
          }
          const newSelector = s.passesJoin(join);
          if(newSelector) {
            return acc.concat(newSelector.selector);
          }
        }
        return acc;
      }, []);
      if(!newSelector || newSelector.length === 0) {
        return false;
      }
      return new Selector(newSelector);
    } else if(_.isPlainObject(this.selector)) {
      const newSelector = _.get(this.selector, join.alias) || _.get(this.selector, join.name);
      if(newSelector) {
        return new Selector(newSelector);
      }
      return false;
    } else if(_.isString(this.selector)) {
      if(this.selector === '*') {
        return new Selector(true);
      }
      let m = /^(!@|[\.@!])(.*)/.exec(this.selector);
      if(m) {
        if(m[1] === '@') {
          if(m[2] === join.table.config.alias || m[2] === join.table.config.name) {
            return new Selector(true);
          } else {
            return this;
          }
        }
        if(m[1] === '!@') {
          const joins = m[2].split(',').map(join => join.trim());
          if(!joins.includes(join.table.config.alias) && !joins.includes(join.table.config.name)) {
            return this;
          }
          return false;
        }
        if(m[1] === '!') {
          const joins = m[2].split(',').map(join => join.trim());
          if(!joins.includes(join.name) && !joins.includes(join.alias)) {
            return this;
          }
          return false;
        }
        if(m[1] === '.' || m[1] === '!.') {
          return this;
        }
      }
      if(/^\./.test(this.selector)) {
        return this;
      }
      if(this.selector === join.name) {
        return new Selector(true);
      }
      m = new RegExp(`${_.escapeRegExp(join.name)}_(.+)`).exec(this.selector);
      if(m) {
        return new Selector(m[1]);
      }
      return false;
    }
    return this;
  }

}

