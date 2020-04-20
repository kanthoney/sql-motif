'use strict';

const Dialect = require('./dialect');
const dialects = require('./dialects');
const ColumnSet = require('./column-set');
const Operator = require('./operator');
const operators = require('./operators');
const RecordSet = require('./recordset');
const _ = require('lodash');

class Table
{
  constructor(config)
  {
    this.config = { ...config };
    if(!this.config.dialect) {
      this.dialect = dialects.default;
    } else if(this.config.dialect instanceof Dialect) {
      this.dialect = this.config.dialect;
    } else if(dialects[this.config.dialect]) {
      this.dialect = dialects[this.config.dialect];
    } else {
      this.dialect = dialects.default;
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
    if(!_.isArray(this.config.indexes)) {
      this.config.indexes = [this.config.indexes];
    }
    this.indexes = this.config.indexes.map(index => ({
      ...index,
      columns: _.isString(index.columns)?[index.columns]:index.columns
    }));
    this.config.references = this.config.references || [];
    if(!_.isArray(this.config.references)) {
      this.config.references = [this.config.references];
    }
    this.references = this.config.references.map(ref => {
      let columns = ref.columns || [];
      if(_.isPlainObject(columns)) {
        columns = Object.keys(columns).map(k => [k, columns[k]]);
      } else if(_.isString(columns)) {
        columns = [columns];
      }
      return { ...ref, columns };
    });
    this.joins = [];
    this.onFields = [];
    this.config.joins.forEach(join => {
      if(join.table instanceof Table) {
        join.name = join.name || join.table.config.name;
        join.table = new Table({
          ...join.table.config,
          columns: join.table.config.columns.concat(join.columns || []),
          alias: join.alias,
          path: this.config.path.concat(join.path || join.name)
        });
      } else {
        join.name = join.name || join.table.name;
        join.table = new Table({
          ...join.table,
          columns: join.table.columns.concat(join.columns || []),
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
          rightCol.joinedTo.push(leftCol.table.config.path.concat(leftCol.path));
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
    const joins = this.joins.reduce((acc, join) => {
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
      return acc.concat(`${clause} ${join.table.from({ ...options, brackets: true })}`);
    }, []);
    if(joins.length > 0 && options.brackets) {
      return `(${[clause].concat(joins).join(' ')})`;
    }
    return [clause].concat(joins).join(' ');
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
    if(col && !col.calc) {
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

  tables(options)
  {
    options = options || {};
    return [this].concat(this.joins.reduce((acc, join) => {
      if((options.writeable && join.readOnly) || (options.joins && options.joins !== '*' && !options.joins.includes(join.name))) {
        return acc;
      }
      return acc.concat(join.table.tables(options));
    }, []));
  }

  select(selector, options)
  {
    return this.selectArray(selector, options).map(field => {
      return field.SQL(true);
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
    if(record instanceof RecordSet) {
      return this.setArray(record.toObject({ includeJoined: true }));
    }
    options = options || {};
    if(options.joins && options.joins !== '*') {
      if(!_.isArray(options.joins)) {
        options.joins = [options.joins];
      }
    }
    return this.columns.values(record, options).map(({ col, value }) => {
      if(col.calc) {
        return acc;
      }
      const fullName = col.sql.fullName;
      if(value instanceof Operator) {
        return `${value.clause(this.dialect), col}`;
      } else if(value instanceof Function) {
        return `${fullName} = ${this.escape(value(col, this.dialect.template))}`;
      } else {
        return `${fullName} = ${this.escape(value)}`;
      }
    }).concat(this.joins.reduce((acc, join) => {
      if(join.readOnly || (options.joins && options.join !== '*' && !options.joins.includes(join.name))) {
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
    return this.set(record, { joins: [], ...options, selector: col => !col.primaryKey, safe: false, fullSafe: false });
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
    if(record instanceof RecordSet) {
      return this.insertValues(record.toObject({ includeJoined: true }));
    }
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
    if(record instanceof RecordSet) {
      return this.whereArray(record.toObject({ includeJoined: true }));
    }
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
    return this.columns.values(record, options).map(({ col, value }) => {
      if(value instanceof Operator) {
        return value.clause(this.dialect, col);
      } else if(value instanceof Function) {
        return `${col.SQL()} = ${this.escape(value(col, this.dialect.template))}`;
      }
      return operators.eq(value).clause(this.dialect, col);
    }).concat(this.joins.reduce((acc, join) => {
      if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
        return acc;
      }
      const subRecord = _.get(record, join.name);
      const where = join.table.where(subRecord || {}, { ...options, safe: false, brackets: _.isArray(subRecord) });
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
    const tables = this.tables({ ...options, writeable: true }).map(table => table.as()).join(', ');
    return `${tables} ${this.From(options)} ${this.WhereKey(record, options)}`;
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

  createIndexesArray()
  {
    return this.indexes.reduce((acc, index) => {
      let s = 'index';
      if(index.unique) {
        s = 'unique ' + s;
      }
      if(index.name) {
        s += ` ${this.escapeId(index.name)}`;
      }
      let cols = index.columns.reduce((acc, name) => {
        const col = this.column(name);
        if(col) {
          return acc.concat(col.sql.name);
        }
        return acc;
      }, []);
      if(cols.length === 0) {
        return acc;
      }
      s += `(${cols.join(', ')})`;
      return acc.concat(s);
    }, []);
  }

  createIndexes()
  {
    return this.createIndexesArray().join(', ');
  }

  createForeignKeysArray()
  {
    return this.references.reduce((acc, ref) => {
      if(!ref.table || !ref.columns) {
        return acc;
      }
      let tableName;
      if(ref.table instanceof Table) {
        tableName = ref.table.fullName();
      } else {
        if(_.isString(ref.table)) {
          tableName = this.escapeId(ref.table);
        } else if(table.name === undefined) {
          return acc;
        } else if(table.schema) {
          tableName = `${this.escapeId(table.schema)}.${this.escapeId(table.name)}`;
        } else {
          tableName = this.escapeId(table.name);
        }
      }
      const cols = ref.columns.reduce((acc, cols) => {
        if(_.isString(cols)) {
          const m = /([^:]+):([^:]+)/.exec(cols);
          if(m) {
            cols = [m[1], m[2]];
          } else {
            cols = [cols, cols];
          }
        } else if(cols.length === 1) {
          cols = [cols[0], cols[0]];
        }
        let leftCol, rightCol;
        leftCol = this.columns.fieldFromName(cols[0]);
        if(!leftCol) {
          return acc;
        }
        leftCol = leftCol.sql.name;
        if(ref.table instanceof Table) {
          rightCol = ref.table.columns.fieldFromName(cols[1]);
          if(!rightCol) {
            return acc;
          }
          rightCol = rightCol.sql.name;
        } else {
          rightCol = `${tableName}.${this.escapeId(cols[1])}`;
        }
        return acc.concat({ left: leftCol, right: rightCol });
      }, []);
      if(cols.length === 0) {
        return acc;
      }
      let s = 'foreign key';
      if(ref.name) {
        s += ` ${this.escapeId(ref.name)}`;
      }
      s += ` (${cols.map(col => col.left).join(', ')}) references ${tableName} (${cols.map(col => col.right).join(', ')})`;
      if(ref.onUpdate) {
        s += ` on update ${ref.onUpdate}`;
      }
      if(ref.onDelete) {
        s += ` on delete ${ref.onDelete}`;
      }
      if(ref.match) {
        s += ` match ${ref.match}`;
      }
      return acc.concat(s);
    }, []);
  }

  createForeignKeys()
  {
    return this.createForeignKeysArray().join(', ');
  }

  create()
  {
    let a = this.createColumnsArray();
    const idx = this.createIndexes();
    if(idx) {
      a.push(idx);
    }
    const pk = this.createPrimaryKey();
    if(pk) {
      a.push(`primary key(${pk})`);
    }
    const fk = this.createForeignKeys();
    if(fk) {
      a.push(fk);
    }
    return `${this.fullName()} (${a.join(', ')})`;
  }

  Create()
  {
    return `create table ${this.create()}`;
  }

  CreateTemp()
  {
    return `create temporary table ${this.create()}`;
  }

  CreateIfNotExists()
  {
    return `create table if not exists ${this.create()}`;
  }

  CreateTempIfNotExists()
  {
    return `create temporary table if not exists ${this.create()}`;
  }

  groupBy(fields)
  {
    fields = [].concat(_.isNil(fields)?[]:fields);
    if(fields.length === 0) {
      fields = this.config.primaryKey;
    }
    return fields.reduce((acc, key) => {
      return acc.concat(this.columns.fieldFromName(key) || this.column(key) || []);
    }, []).map(col => col.sql.fullName).join(', ');
  }

  GroupBy(fields)
  {
    const clause = this.groupBy(fields);
    if(clause) {
      return `GROUP BY ${clause}`;
    }
    return '';
  }

  orderBy(fields)
  {
    if(!fields) {
      fields = this.config.primaryKey;
    }
    return fields.reduce((acc, field) => {
      let dir = 'asc';
      const m = /^(.+)\s+(asc|desc)$/i.exec(field);
      if(m) {
        field = m[1];
        dir = m[2];
      }
      let col = this.columns.fieldFromName(field);
      if(col) {
        return acc.concat({ col, dir });
      }
      col = this.column(field);
      if(col) {
        return acc.concat({ col, dir });
      }
      return acc;
    }, []).map(({ col, dir }) => `${col.sql.fullName} ${dir}`).join(', ');
  }

  OrderBy(fields)
  {
    const clause = this.orderBy(fields);
    if(clause) {
      return `ORDER BY ${clause}`;
    }
    return '';
  }

  limit(start, count)
  {
    if(count === undefined) {
      if(start === undefined) {
        return '';
      }
      return this.escape(start);
    }
    return `${this.escape(start)}, ${this.escape(count)}`;
  }

  Limit(start, count)
  {
    if(count === undefined) {
      if(start === undefined) {
        return '';
      }
      return `limit ${this.escape(start)}`;
    }
    return `limit ${this.escape(start)}, ${this.escape(count)}`;
  }

  toRecordSet(record)
  {
    if(record instanceof RecordSet) {
      return record;
    }
    const r = new RecordSet(this);
    r.addRecord(record);
    return r;
  }

  validate(record, context)
  {
    return this.toRecordSet(record).validate(context);
  }

  validateAsync(record, context)
  {
    return this.toRecordSet(record).validateAsync(context);
  }

  fill(record, context)
  {
    return this.toRecordSet(record).fill(context);
  }

  fillAsync(record, context)
  {
    return this.toRecordSet(record).fillAsync(context);
  }

  collate(lines)
  {
    const r = new RecordSet(this);
    return r.addSQLResult(lines);
  }
};

module.exports = Table;
