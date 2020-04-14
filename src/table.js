'use strict';

const dialects = require('./dialects');
const Dialect = require('./dialect');
const ColumnSet = require('./column-set');
const Operator = require('./operator');
const operators = require('./operators');
const _ = require('lodash');

module.exports = defaults => {
  class Table
  {
    constructor(config)
    {
      this.config = _.defaults(config, defaults);
      if(!this.config.dialect) {
        this.dialect = new dialects.default;
      } else if(this.config.dialect instanceof Dialect) {
        this.dialect = this.config.dialect;
      } else if(dialects[this.config.dialect]) {
        this.dialect = new dialects[this.config.dialect];
      } else {
        this.dialect = new dialects.default;
      }
      this.config.path = this.config.path || [];
      if(!_.isArray(this.config.path)) {
        this.config.path = [this.config.path];
      }
      this.config.joins = this.config.joins || [];
      if(!_.isArray(this.config.joins)) {
        this.config.joins = [this.config.joins];
      }
      this.columns = new ColumnSet({
        table: this,
        types: config.types,
        columns: config.columns,
        dialect: this.dialect,
        path: []
      });
      const keyColumns = this.columns.fields(col => col.table === this && col.primaryKey);
      this.config.primaryKey = keyColumns.reduce((acc, col) => {
        if(!acc.includes(col.name)) {
          return acc.concat(col.name);
        }
        return acc;
      }, this.config.primaryKey || []);
      this.columns.fields(col => col.table === this && this.config.primaryKey.includes(col.name)).forEach(col => {
        col.primaryKey = true;
      });
      this.config.indexes = this.config.indexes || [];
      this.joins = [];
      this.config.joins.forEach(join => {
        if(join.table instanceof Table) {
          join.table = new Table({
            ...join.table.config,
            alias: join.alias,
            path: this.config.path.concat(join.path || join.name || join.table.config.alias || join.table.config.name)
          });
        } else {
          join.table = new Table({
            ...join.table,
            alias: join.alias,
            path: this.path.concat(join.path || join.name || join.table.alias || join.table.name)
          });
        }
        let on = join.on || [];
        if(!_.isArray(on)) {
          if(_.isPlainObject(on)) {
            on = Object.keys(on).map(k => [ k, on[k] ]);
          } else {
            on = [on];
          }
        }
        on = on.reduce((acc, on) => {
          let left, right;
          if(_.isString(on)) {
            const m = /([^:]+):([^:]+)/.exec(on);
            if(m) {
              left = m[1];
              right = m[2];
            } else {
              left = on;
              right = on;
            }
          } else {
            left = on[0];
            right = on[1];
          }
          const leftCol = join.table.columnFromName(left);
          const rightCol = this.columnFromAlias(right);
          if(leftCol && rightCol) {
            return acc.concat({ left: leftCol, right: rightCol });
          }
          return acc;
        }, []);
        let sql;
        switch(join.type) {
          case 'left':
            sql = 'left join';
            break;

          case 'right':
            sql = 'right join';
            break;

          case 'outer':
            sql = 'outer join';
            break;

          default:
            sql = 'inner join';
            break;
        }
        sql += ` ${join.table.fullNameAs()}`;
        if(on.length > 0) {
          sql += ' on ' + on.map(on => `${on.left.sql.fullName} = ${on.right.sql.fullName}`).join(' and ');
        }
        join.colMap = on.reduce((acc, on) => {
          acc[on.right.alias || on.right.name] = on.left;
          return acc;
        }, {});
        this.joins.push({ ...join, sql });
      });
    }

    escape(s)
    {
      return this.dialect.escape(s);
    }

    escapeId(s)
    {
      return this.dialect.escapeId(s);
    }

    name()
    {
      return this.escapeId(this.config.name);
    }

    fullName()
    {
      if(this.config.schema) {
        return `${this.escapeId(this.config.schema)}.${this.name()}`;
      }
      return this.name();
    }

    fullNameAs()
    {
      if(this.config.alias) {
        return `${this.fullName()} as ${this.escapeId(this.config.alias)}`;
      }
      return this.fullName();
    }

    as()
    {
      if(this.config.alias) {
        return this.escapeId(this.config.alias);
      }
      return this.fullName();
    }

    join(config)
    {
      return new Table({
        ...this.config,
        joins: this.config.joins.concat(config)
      });
    }

    from(options)
    {
      options = options || {};
      if(options.joins && options.joins !== '*') {
        if(!_.isArray(options.joins)) {
          options.joins = [options.joins];
        }
      }
      return [this.fullNameAs()].concat(this.joins.reduce((acc, join) => {
        if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
          return acc;
        }
        return acc.concat(join.sql);
      }, [])).join(' ');
    }

    From(options)
    {
      return `from ${this.from(options)}`;
    }

    columnFromName(name)
    {
      return this.columns.fieldFromName(name) || this.joins.reduce((acc, join) => {
        if(acc !== undefined) {
          return acc;
        }
        return join.table.columnFromName(name);
      }, undefined);
    }

    columnFromAlias(alias)
    {
      return this.columns.fieldFromAlias(alias) || this.joins.reduce((acc, join) => {
        if(acc !== undefined) {
          return acc;
        }
        return join.table.columnFromAlias(alias);
      }, undefined);
    }

    select(selector)
    {
      return this.selectArray(selector).map(field => {
        return field.sql.fullNameAs;
      }).join(', ');
    }

    selectArray(selector)
    {
      return this.columns.fields(selector).concat(
        this.joins.reduce((acc, join) => {
          return acc.concat(join.table.columns.fields(selector));
        }, [])
      );
    }

    Select(selector)
    {
      return `select ${this.select(selector)}`;
    }

    set(record, options)
    {
      options = options || {};
      if(options.joins && options.joins !== '*') {
        if(!_.isArray(options.joins)) {
          options.joins = [options.joins];
        }
      }
      return this.columns.values(record, options).map(field => {
        if(field.value instanceof Operator) {
          return `${field.col.sql.fullName} ${field.value.clause(this.dialect)}`;
        } else {
          return `${field.col.sql.fullName} = ${this.escape(field.value)}`;
        }
      }).concat(this.joins.reduce((acc, join) => {
        if(options.joins && options.join !== '*' && !options.joins.includes(join.name)) {
          return acc;
        }
        return acc.concat(join.table.columns.values(record, options).map(field => {
          if(field.value instanceof Operator) {
            return `${field.col.sql.fullName} ${field.value.clause(this.dialect)}`;
          } else {
            return `${field.col.sql.fullName} = ${this.escape(field.value)}`;
          }
        }));
      }, [])).join(', ');
    }

    setNonKey(record, options)
    {
      return this.set(record, { joins: [], ...options, selector: col => !col.primaryKey });
    }

    Set(record, options)
    {
      return `set ${this.set(record, options)}`;
    }

    SetNonKey(record, options)
    {
      return `set ${this.setNonKey(record, options)}`;
    }

    where(record, options)
    {
      options = _.defaults(options || {}, { default: '1 = 1' });
      if(options.joins && options.joins !== '*') {
        if(!_.isArray(options.joins)) {
          options.joins = [options.joins];
        }
      }
      if(_.isArray(record)) {
        if(record.length === 0) {
          return options.default;
        }
        return record.map(record => `(${this.where(record, options)})`).join(' or ');
      }
      const clause = this.columns.values(record, options).map(field => {
        if(field.value instanceof Operator) {
          return `${field.col.sql.fullName} ${field.value.clause(this.dialect)}`;
        }
        return `${field.col.sql.fullName} ${operators.eq(field.value).clause(this.dialect)}`;
      }).concat(this.joins.reduce((acc, join) => {
        if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
          return acc;
        }
        const subRecord = _.get(record, join.table.config.path);
        return acc.concat(join.table.columns.values(subRecord || {}, options).map(field => {
          if(field.value instanceof Operator) {
            return `${field.col.sql.fullName} ${field.value.clause(this.dialect)}`;
          }
          return `${field.col.sql.fullName} ${operators.eq(field.value).clause(this.dialect)}`;
        }));
      }, [])).join(' and ');
      return clause || options.default;
    }

    whereKey(record, options)
    {
      return this.where(record, { joins: [], ...options, selector: col => col.primaryKey });
    }

    Where(record, options)
    {
      return `where ${this.where(record, options)}`;
    }

    WhereKey(record, options)
    {
      return `where ${this.whereKey(record, options)}`;
    }

    update(record, old, options)
    {
      options = { joins: [], ...options };
      if(old) {
        return `${this.from(options)} ${this.Set(record, options)} ${this.Where(old, { selector: col => col.primaryKey, ...options })}`;
      }
      return `${this.from(options)} ${this.SetNonKey(record, options)} ${this.Where(record, { selector: col => col.primaryKey, ...options })}`;
    }

    Update(record, old, options)
    {
      return `update ${this.update(record, old, options)}`;
    }

    delete(record, options)
    {
      options = { joins: [], selector: col => col.primaryKey, ...options };
      return `${this.From(options)} ${this.Where(record, options)}`;
    }

    Delete(record, options)
    {
      return `delete ${this.delete(record, options)}`;
    }

    createColumnsArray()
    {
      return this.columns.fields(col => col.table === this).map(col => {
        let s = `${col.sql.name} ${col.type}`;
        if(col.notNull) {
          s += ' not null';
        }
        if(col.default !== undefined && !_.isFunction(col.default)) {
          s += ` default ${this.escape(col.default)}`;
        }
        return s;
      });
    }

    createColumns()
    {
      return this.createColumnsArray().join(', ');
    }

    createPrimaryKeyArray()
    {
      return this.config.primaryKey.reduce((acc, name) => {
        return acc.concat(this.columns.fields(col => col.table === this && col.name === name).map(col => col.sql.name));
      }, []);
    }

    createPrimaryKey()
    {
      return this.createPrimaryKeyArray().join(', ');
    }

    create()
    {
      let a = this.createColumnsArray();
      const pk = this.createPrimaryKey();
      if(pk) {
        a.push(`primary key(${pk})`);
      }
      return `(${a.join(', ')})`;
    }

  }
  return Table;
}
