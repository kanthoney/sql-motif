'use strict';

const Dialect = require('./dialect');
const dialects = require('./dialects');
const ColumnSet = require('./column-set');
const Operator = require('./operator');
const operators = require('./operators');
const RecordSet = require('./recordset');
const Record = require('./record');
const _ = require('lodash');
const Selector = require('./selector');
const TypeExpander = require('./type-expander');

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
    const typeExpander = new TypeExpander(this.config.types);
    this.columns = config.columns instanceof ColumnSet?config.columns.reTable(this):new ColumnSet({
      table: this,
      columns: config.columns.map(col => typeExpander.expand({ ...col, table: this })),
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
    this.config.joins.forEach(spec => {
      let join = {...spec};
      if(spec.table instanceof Table) {
        join.name = spec.name || spec.table.config.name;
        join.table = new Table({
          ...spec.table.config,
          columns: spec.table.columns.concat((spec.columns || []).map(col => typeExpander.expand({ ...col, table: spec.table }))),
          alias: spec.alias || spec.table.config.alias,
          path: this.config.path.concat(spec.path || join.name),
          parent: this
        });
      } else {
        join.name = spec.name || spec.config.name;
        join.table = new Table({
          ...spec.table,
          columns: spec.table.columns.concat(spec.columns || []),
          alias: spec.alias,
          path: this.config.path.concat(spec.path || join.name || []),
          parent: this
        });
      }
      let { on, where } = [].concat(spec.on || []).reduce((acc, on) => {
        let left, right;
        if(_.isPlainObject(on)) {
          acc.where = Object.assign(acc.where || {}, on);
          return acc;
        }
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
        const leftCol = join.table.column(left);
        const rightCol = this.column(right);
        if(leftCol && rightCol) {
          leftCol.joinCol = rightCol;
          rightCol.joinedTo.push(leftCol.table.config.path.concat(leftCol.subTableColPath || leftCol.path));
          acc.on = acc.on.concat({ left: leftCol, right: rightCol, join });
        } else {
          console.warn(
            `Problem creating join for table ${this.config.name} with left column '${left}' and right column '${right}'`
          );
        }
        return acc;
      }, { on: [] });
      if(where) {
        join.table.onWhere = where;
      }
      on.forEach(on => {
        this.onFields.push(on);
      });
      this.joins.push(join);
    });
    this.joinedMap = {};
  }

  escape(s, context)
  {
    return this.dialect.escape(s, context);
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
      columns: this.columns,
      joins: this.config.joins.concat(config)
    });
  }

  subquery(config)
  {
    config = config || {};
    const selector = new Selector(config.selector);
    const subTable = config.columns?this.extend({ columns: config.columns }):this;
    const table = new Table({
      ...this.config,
      alias: config.alias || `${this.config.alias || this.config.name}_subquery`,
      columns: [],
      joins: [],
      subtable: {
        type: 'subquery',
        table: subTable,
        selector,
        query: config.query
      }
    });
    table.columns = subTable.columns.subTable(selector, table, true, true);
    return table;
  }

  view(config)
  {
    config = config || {};
    const selector = new Selector(config.selector);
    const subTable = config.columns?this.extend({ columns: config.columns }):this;
    const table = new Table({
      ...this.config,
      name: config.name || `${this.config.name}_view`,
      schema: config.schema || this.config.schema,
      columns: [],
      joins: [],
      subtable: {
        type: 'view',
        table: subTable,
        selector,
        query: config.query
      }
    });
    table.columns = subTable.columns.subTable(selector, table, true, true);
    return table;
  }

  from(options)
  {
    options = options || {};
    let clause = this.fullNameAs();
    if(this.config.subtable && this.config.subtable.type === 'subquery') {
      if(_.isString(this.config.subtable.query)) {
        clause = `( ${this.config.subtable.query} ) as ${this.escapeId(this.config.alias)}`;
      } else if(_.isFunction(this.config.subtable.query)) {
        clause = `( ${this.config.subtable.query({
          table: this.config.subtable.table,
          selector: this.config.subtable.selector,
          sql: this.dialect.template(),
          context: options.context
        })} ) as ${this.escapeId(this.config.alias)}`;
      } else {
        clause = `( ${this.config.subtable.table.SelectWhere(this.config.subtable.selector)} ) as ${this.escapeId(this.config.alias)}`;
      }
    }
    if(options.joins && options.joins !== '*') {
      if(!_.isArray(options.joins)) {
        options.joins = [options.joins];
      }
    }
    let where;
    if(options.where || this.onWhere) {
      where = Object.assign({}, this.onWhere, options.where);
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
      acc.clause += ` ${clause} ${join.table.from({ ...options, brackets: true, where: _.get(where, join.path || join.name) })}`;
      const subWhere = _.get(where, join.path || join.name);
      if(subWhere) {
        acc.on = acc.on.concat(join.table.columns.whereArray(subWhere));
      }
      return acc;
    }, { clause: '', on: [] });
    clause += joins.clause;
    const onArray = this.onFields.reduce((acc, on) => {
      if(!options.joins || options.joins === '*' || options.joins.includes(on.join.name)) {
        acc.push(`${on.left.sql.fullName} = ${on.right.sql.fullName}`);
      }
      return acc;
    }, joins.on);
    if(onArray.length > 0) {
      clause += ` on ${onArray.join(' and ')}`;
    }
    if(options.brackets && joins.clause) {
      return `(${clause})`;
    }
    return clause;
  }

  From(options)
  {
    return `from ${this.from(options)}`;
  }

  on(where)
  {
    let on = this.onFields.map(field => `${field.left.sql.fullName} = ${field.right.sql.fullName}`);
    if(where) {
      on = on.concat(this.columns.whereArray(where));
    }
    return on.join(' and ');
  }

  On(where)
  {
    let clause = this.on(where);
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

  column(alias, subTable)
  {
    if(!subTable) {
      alias = this.config.path.concat(alias).join('_');
    }
    return this.columns.fieldFromAlias(alias) || this.joins.reduce((acc, join) => {
      if(acc !== undefined) {
        return acc;
      }
      return join.table.column(alias, true);
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

  select(selector, options = {})
  {
    return this.selectArray(selector, options).map(field => {
      return field.SQL(true, options.context);
    }).join(', ');
  }

  selectArray(selector, options)
  {
    if(!(selector instanceof Selector)) {
      return this.selectArray(new Selector(selector), options);
    }
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
        const newSelector = selector.passesJoin(join);
        if(newSelector) {
          return acc.concat(join.table.selectArray(newSelector, options));
        }
        return acc;
      }, [])
    );
  }

  Select(selector, options)
  {
    return `select ${this.select(selector, options)}`;
  }

  selectWhere(selector, where, options)
  {
    if(where) {
      return `${this.select(selector, options)} ${this.From(options)} ${this.Where(where, options)}`;
    }
    return `${this.select(selector, options)} ${this.From(options)}`;
  }

  SelectWhere(selector, where, options)
  {
    return `select ${this.selectWhere(selector, where, options)}`;
  }

  selectWhereKey(selector, where, options)
  {
    if(where) {
      return `${this.select(selector, options)} ${this.From(options)} ${this.WhereKey(where, options)}`;
    }
    return `${this.select(selector, options)} ${this.From(options)}`;
  }

  SelectWhereKey(selector, where, options)
  {
    return `select ${this.selectWhereKey(selector, where, options)}`;
  }

  selectWhereMainKey(selector, where, options)
  {
    if(where) {
      return `${this.select(selector, options)} ${this.From(options)} ${this.WhereKey(where, { ...options, joins: [] })}`;
    }
    return `${this.select(selector, options)} ${this.From(options)}`;
  }

  SelectWhereMainKey(selector, where, options)
  {
    return `select ${this.selectWhereMainKey(selector, where, options)}`;
  }

  setArray(record, options)
  {
    options = options || {};
    return this.columns.setArray(record, options).concat(this.joins.reduce((acc, join) => {
      if(join.readOnly || (options.joins && options.joins !== '*' && !options.joins.includes(join.name))) {
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
    return this.set(record, { ...options, selector: col => !col.primaryKey, safe: false });
  }

  Set(record, options)
  {
    const clause = this.set(record, options);
    if(clause) {
      return `set ${clause}`;
    }
    return '';
  }

  SetNonKey(record, options)
  {
    const clause = this.setNonKey(record, options);
    if(clause) {
      return `set ${clause}`;
    }
    return '';
  }

  insertColumns()
  {
    return this.columns.fields().map(col => col.sql.name).join(', ');
  }

  insertValues(record)
  {
    if(record instanceof RecordSet) {
      return this.insertValues(record.toObject({ noSubrecords: true, mapJoined: true, includeJoined: true }));
    }
    if(record instanceof Record) {
      return record.insertValues();
    }
    if(_.isArray(record)) {
      return record.map(record => this.insertValues(record)).join(', ');
    }
    const values = this.columns.fields().reduce((acc, col) => {
      if(col.calc) {
        return acc;
      }
      const value = _.get(record, col.path);
      if(value === undefined) {
        return acc.concat(this.dialect.options.insertDefault || 'default');
      }
      return acc.concat(this.dialect.escape(value));
    }, []);
    return `(${values.join(', ')})`;
  }

  insert(record)
  {
    const values = this.insertValues(record);
    if(values) {
      return `${this.fullName()} (${this.insertColumns()}) values ${values}`;
    }
    return '';
  }

  Insert(record)
  {
    const insert = this.insert(record);
    if(insert) {
      return `insert into ${insert}`;
    }
    return '';
  }

  InsertIgnore(record)
  {
    return this.dialect.insertIgnore(this, record);
  }

  whereArray(record, options)
  {
    return this.columns.whereArray(record, options).concat(this.joins.reduce((acc, join) => {
      if(options.joins && options.joins !== '*' && !options.joins.includes(join.name)) {
        return acc;
      }
      const subRecord = _.get(record, join.path || join.name);
      const where = join.table.where(subRecord || {}, {
        ...options,
        joined: _.get(options.joined, join.path || join.name),
        safe: options.safe && !join.readOnly,
        brackets: _.isArray(subRecord),
        default: ''
      });
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
    return this.where(record, { ...options, selector: col => col.primaryKey });
  }

  Where(record, options)
  {
    return `where ${this.where(record, { default: '1 = 1', ...options })}`;
  }

  WhereKey(record, options)
  {
    return `where ${this.whereKey(record, options)}`;
  }

  whereKeySafe(record, options)
  {
    return this.whereKey(record, { ...options, safe: true });
  }

  WhereKeySafe(record, options)
  {
    return `where ${this.whereKeySafe(record, options)}`;
  }

  whereSafe(record, options)
  {
    return this.where(record, { ...options, safe: true });
  }

  WhereSafe(record, options)
  {
    return `where ${this.whereSafe(record, options)}`;
  }

  update(record, old, options)
  {
    options = options || {};
    if(this.dialect.options.singleTableUpdate) {
      options.joins = [];
    }
    if(old) {
      const setClause = this.Set(record, { ...options, safe: false });
      if(setClause) {
        return `${this.from(options)} ${setClause} ${this.WhereKey(old, options)}`;
      }
      return '';
    }
    const setClause = this.SetNonKey(record, { ...options, safe: false });
    if(setClause) {
      return `${this.from(options)} ${setClause} ${this.WhereKey(record, options)}`;
    }
    return '';
  }

  Update(record, old, options)
  {
    return `update ${this.update(record, old, options)}`;
  }

  updateWhere(record, where, options)
  {
    options = options || {};
    if(this.dialect.options.singleTableUpdate) {
      options.joins = [];
    }
    const setClause = this.Set(record, options);
    if(setClause) {
      return `${this.from(options)} ${setClause} ${this.Where(where, options)}`;
    }
    return '';
  }

  UpdateWhere(record, where, options)
  {
    return `update ${this.updateWhere(record, where, options)}`;
  }

  updateSafe(record, old, options)
  {
    return this.update(record, old, { ...options, safe: true });
  }

  UpdateSafe(record, old, options)
  {
    return this.Update(record, old, { ...options, safe: true });
  }

  updateWhereSafe(record, where, options)
  {
    return this.updateWhere(record, where, { ...options, safe: true });
  }

  UpdateWhereSafe(record, where, options)
  {
    return this.UpdateWhere(record, where, { ...options, safe: true });
  }

  delete(record, options)
  {
    options = { selector: col => col.primaryKey, ...options };
    if(this.dialect.options.singleTableDelete) {
      options.joins = [];
      return `${this.From(options)} ${this.WhereKey(record, options)}`;
    }
    const tables = this.tables({ ...options, writeable: true }).map(table => table.as()).join(', ');
    return `${tables} ${this.From(options)} ${this.WhereKey(record, options)}`;
  }

  Delete(record, options)
  {
    return `delete ${this.delete(record, options)}`;
  }

  deleteSafe(record, options)
  {
    return this.delete(record, { ...options, safe: true });
  }

  DeleteSafe(record, options)
  {
    return `delete ${this.deleteSafe(record, options)}`;
  }

  createColumnsArray()
  {
    return this.columns.fields(col => col.table === this).reduce((acc, col) => {
      if(col.calc) {
        return acc;
      }
      let s = `${col.sql.name} ${col.type}`;
      if(col.notNull) {
        s += ' not null';
      }
      if(col.default !== undefined && !_.isFunction(col.default)) {
        s += ` default ${this.escape(col.default)}`;
      }
      return acc.concat(s);
    }, []);
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
    const a = this.createPrimaryKeyArray();
    if(a.length > 0) {
      return `primary key(${a.join(', ')})`;
    }
    return '';
  }

  createIndexesArray()
  {
    if(this.dialect.options.noIndexesInCreate) {
      return [];
    }
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
          rightCol = this.escapeId(cols[1]);
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

  createArray()
  {
    return [].concat(
      this.createColumnsArray(),
      this.createIndexesArray(),
      this.createPrimaryKey() || [],
      this.createForeignKeysArray()
    );
  }

  create()
  {
    if(this.config.subtable && this.config.subtable.type === 'view') {
      let query = `${this.fullName()} as `;
      if(_.isString(this.config.subtable.query)) {
        query += this.config.subtable.query;
      } else if(_.isFunction(this.config.subtable.query)) {
        query += this.config.subtable.query({
          table: this.config.subtable.table,
          selector: this.config.subtable.selector,
          sql: this.dialect.template()
        });
      } else {
        query += this.config.subtable.table.SelectWhere(this.config.subtable.selector);
      }
      return query;
    }
    return `${this.fullName()} (${this.createArray().join(', ')})`;
  }

  Create()
  {
    if(this.config.subtable && this.config.subtable.type === 'view') {
      return `create view ${this.create()}`;
    }
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

  drop()
  {
    return this.fullName();
  }

  Drop()
  {
    return `drop table ${this.drop()}`;
  }

  DropIfExists()
  {
    return `drop table if exists ${this.drop()}`;
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
      return `group by ${clause}`;
    }
    return '';
  }

  orderBy(fields)
  {
    if(!fields) {
      fields = this.config.primaryKey;
    }
    if(!_.isArray(fields)) {
      fields = [fields];
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
      return `order by ${clause}`;
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

  toRecordSet(record, options)
  {
    if(record instanceof RecordSet) {
      return record;
    }
    const r = new RecordSet(this, options);
    r.addRecord(record);
    return r;
  }

  validate(record, options)
  {
    return this.toRecordSet(record).validate(options);
  }

  validateKey(record, options)
  {
    return this.validate(record, { ...options, selector: col => col.primaryKey });
  }

  validateAsync(record, options)
  {
    return this.toRecordSet(record).validateAsync(options);
  }

  validateKeyAsync(record, context)
  {
    return this.validateAsync(record, { ...options, selector: col => col.primaryKey });
  }

  fill(record, options)
  {
    return this.toRecordSet(record).fill(options);
  }

  fillAsync(record, options)
  {
    return this.toRecordSet(record).fillAsync(options);
  }

  collate(lines, options = {})
  {
    const r = new RecordSet(this, options);
    const result = r.addSQLResult(lines);
    if(options.json) {
      return result.toJSON();
    }
    return result;
  }

  extend(config)
  {
    config = config || {};
    const typeExpander = new TypeExpander(this.config.types);
    return new Table({
      ...this.config,
      ...config,
      columns: this.columns.concat((config.columns || []).map(col => typeExpander.expand({ ...col, table: this }))),
      indexes: this.config.indexes.concat(config.indexes || []),
      references: this.config.references.concat(config.references || []),
      joins: this.config.joins.concat(config.joins || [])
    });
  }
};

module.exports = Table;
