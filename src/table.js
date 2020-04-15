'use strict';

const Dialect = require('./dialect');
const dialects = require('./dialects');
const ColumnSet = require('./column-set');
const Operator = require('./operator');
const operators = require('./operators');
const _ = require('lodash');

class Table
{
  constructor(config)
  {
    this.config = { ...config };
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
    this.onFields = [];
    this.config.joins.forEach(join => {
      if(join.table instanceof Table) {
        join.name = join.name || join.table.config.name;
        join.table = new Table({
          ...join.table.config,
          alias: join.alias,
          path: this.config.path.concat(join.path || join.name)
        });
      } else {
        join.name = join.name || join.table.name;
        join.table = new Table({
          ...join.table,
          alias: join.alias,
          path: this.path.concat(join.path || join.name)
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
        left = join.table.config.path.concat(left).join('_');
        right = this.config.path.concat(right).join('_');
        const leftCol = join.table.column(left);
        const rightCol = this.column(right);
        if(leftCol && rightCol) {
          leftCol.joinCol = rightCol;
          return acc.concat({ left: leftCol, right: rightCol });
        } else {
          console.warn(
            `Problem creating join for table ${this.config.name} with left column '${left}' and right column '${right}'`
          );
        }
        return acc;
      }, []);
      on.forEach(on => {
        on.left.table.onFields.push(on);
      });
      join.colMap = on.reduce((acc, on) => {
        acc[on.right.alias || on.right.name] = on.left;
        return acc;
      }, {});
      this.joins.push(join);
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
    let clause = this.fullNameAs();
    let on = this.On();
    if(on) {
      clause = `${clause} ${on}`;
    }
    return [clause].concat(this.joins.reduce((acc, join) => {
      if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
        return acc;
      }
      let clause;
      switch(join.type) {
        case 'left':
        clause = 'left join';
        break;

        case 'right':
        clause = 'right join';
        break;

        case 'outer':
        clause = 'outer join';
        break;

        default:
        clause = 'inner join';
        break;
      }
      return acc.concat(`${clause} ${join.table.from(options)}`);
    }, [])).join(' ');
  }

  From(options)
  {
    return `from ${this.from(options)}`;
  }

  on()
  {
    return this.onFields.map(field => `${field.left.sql.fullName} = ${field.right.sql.fullName}`).join(' and ');
  }

  On()
  {
    let clause = this.on();
    if(clause) {
      return `on ${clause}`;
    }
    return '';
  }

  columnName(alias)
  {
    const col = this.column(alias);
    if(col) {
      return col.sql.fullName;
    }
    return '';
  }

  column(alias)
  {
    return this.columns.fieldFromAlias(alias) || this.joins.reduce((acc, join) => {
      if(acc !== undefined) {
        return acc;
      }
      return join.table.column(alias);
    }, undefined);
  }

  select(selector, options)
  {
    return this.selectArray(selector, options).map(field => {
      return field.sql.fullNameAs;
    }).join(', ');
  }

  selectArray(selector, options)
  {
    options = options || {};
    if(options.joins && options.joins !== '*') {
      if(!_.isArray(options.joins)) {
        options.joins = [options.joins];
      }
    }
    return this.columns.fields(selector).concat(
      this.joins.reduce((acc, join) => {
        if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
          return acc;
        }
        return acc.concat(join.table.columns.fields(selector));
      }, [])
    );
  }

  Select(selector, options)
  {
    return `select ${this.select(selector, options)}`;
  }

  setArray(record, options)
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
      } else if(field.value instanceof Function) {
        return `${field.col.sql.fullName} = ${this.escape(field.value(field.col, this.dialect.template))}`;
      } else {
        return `${field.col.sql.fullName} = ${this.escape(field.value)}`;
      }
    }).concat(this.joins.reduce((acc, join) => {
      if(options.joins && options.join !== '*' && !options.joins.includes(join.name)) {
        return acc;
      }
      const subRecord = _.get(record, join.name);
      return acc.concat(join.table.setArray(subRecord, options));
    }, []));
  }

  set(record, options)
  {
    return this.setArray(record, options).join(', ');
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

  insertColumns()
  {
    return this.columns.fields().map(col => col.sql.name).join(', ');
  }

  insertValues(record)
  {
    if(_.isArray(record)) {
      return record.map(record => this.insertValues(record)).join(', ');
    }
    const values = this.columns.fields().map(col => {
      const value = _.get(record, col.path || col.alias || col.name);
      if(value === undefined) {
        return 'default';
      }
      return this.dialect.escape(value);
    });
    return `(${values.join(', ')})`;
  }

  insert(record)
  {
    return `${this.fullName()} (${this.insertColumns()}) values ${this.insertValues(record)}`;
  }

  Insert(record)
  {
    return `insert into ${this.insert(record)}`;
  }

  InsertIgnore(record)
  {
    return this.dialect.insertIgnore(this, record);
  }

  whereArray(record, options)
  {
    options = _.defaults(options || {}, { default: '' });
    if(options.joins && options.joins !== '*') {
      if(!_.isArray(options.joins)) {
        options.joins = [options.joins];
      }
    }
    if(_.isArray(record)) {
      if(record.length === 0) {
        return options.default;
      }
      const clauses = record.map(record => this.where(record, { ...options, brackets: true }));
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
    return this.columns.values(record, options).map(field => {
      if(field.value instanceof Operator) {
        return `${field.col.sql.fullName} ${field.value.clause(this.dialect)}`;
      } else if(field.value instanceof Function) {
        return `${field.col.sql.fullName} = ${this.escape(field.value(field.col, this.dialect.template))}`;
      }
      return `${field.col.sql.fullName} ${operators.eq(field.value).clause(this.dialect)}`;
    }).concat(this.joins.reduce((acc, join) => {
      if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
        return acc;
      }
      const subRecord = _.get(record, join.name);
      const where = join.table.where(subRecord || {}, { ...options, brackets: _.isArray(subRecord) });
      if(!where) {
        return acc;
      }
      return acc.concat(where);
    }, []));
  }

  where(record, options)
  {
    options = { default: '', ...options };
    const clauses = this.whereArray(record, options);
    if(clauses.length === 0) {
      return options.default;
    }
    if(options.brackets && clauses.length > 1) {
      return `(${clauses.join(' and ')})`;
    }
    return clauses.join(' and ');
  }

  whereKey(record, options)
  {
    return this.where(record, { joins: [], ...options, selector: col => col.primaryKey });
  }

  Where(record, options)
  {
    return `where ${this.where(record, { default: '1 = 1', ...options })}`;
  }

  WhereKey(record, options)
  {
    return `where ${this.whereKey(record, options)}`;
  }

  update(record, old, options)
  {
    options = { joins: [], ...options };
    if(old) {
      return `${this.from(options)} ${this.Set(record, options)} ${this.WhereKey(old, options)}`;
    }
    return `${this.from(options)} ${this.SetNonKey(record, options)} ${this.WhereKey(record, options)}`;
  }

  Update(record, old, options)
  {
    return `update ${this.update(record, old, options)}`;
  }

  delete(record, options)
  {
    options = { joins: [], selector: col => col.primaryKey, ...options };
    return `${this.From(options)} ${this.WhereKey(record, options)}`;
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

};

module.exports = Table;
