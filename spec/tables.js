'use strict';

const types = require('./types');
const { Table } = require('../index')({ types });

module.exports.orders = new Table({
  schema: 's1',
  name: 'orders',
  columns: [
    { name: 'company', type: 'account', primaryKey: true, notNull: true },
    { name: 'order_id', type: 'primaryId' },
    { name: 'order_date', type: 'date' },
    { name: 'customer', type: 'account' },
    { name: 'delivery', type: 'contact' },
    { name: 'billing', type: 'contact', alias: 'invoice' }
  ]
});

module.exports.order_lines = new Table({
  name: 'order_lines',
  alias: 'ol1',
  columns: [
    { name: 'company', type: 'account', notNull: true, primaryKey: true },
    { name: 'order_id', type: 'primaryId' },
    { name: 'line_no', type: 'int', notNull: true, primaryKey: true, default: ({ context }) => context.line_no++ },
    { name: 'sku', type: 'sku' },
    { name: 'description', type: 'text' },
    { name: 'qty', type: 'qty', notNull: true },
    { name: 'price', type: 'price', notNull: true }
  ],
  indexes: [
    {
      name: 'stock_idx',
      columns: ['company', 'sku']
    },
    {
      columns: 'order_id'
    }
  ]
});

module.exports.stock = new Table({
  name: 'stock',
  columns: [
    { name: 'company', type: 'account', notNull: true },
    { name: 'sku', type: 'sku', notNull: true },
    { name: 'description', type: 'text', notNull: true, default: '' }
  ],
  primaryKey: [ 'company', 'sku' ]
});

module.exports.warehouse = new Table({
  name: 'warehouse',
  schema: 's1',
  alias: 'w1',
  columns: [
    { name: 'company', type: 'account', notNull: true, primaryKey: true },
    { name: 'name', type: 'addressLine', primaryKey: true },
    { name: 'description', type: 'text', notNull: true },
    { name: 'address', type: 'address' }
  ]
});

module.exports.warehouse_bins = new Table({
  name: 'warehouse_bins',
  columns: [
    { name: 'company', type: 'account', notNull: true },
    { name: 'warehouse_name', type: 'addressLine', notNull: true },
    { name: 'bin', type: 'bin', notNull: true }
  ],
  primaryKey: ['company', 'warehouse_name', 'bin']
});

module.exports.inventory = new Table({
  name: 'inventory',
  columns: [
    { name: 'company', type: 'account', notNull: true },
    { name: 'sku', type: 'sku', notNull: true },
    { name: 'warehouse_name', type: 'addressLine', notNull: true },
    { name: 'bin', type: 'bin', notNull: true },
    { name: 'time', type: 'datetime', notNull: true },
    { name: 'qty', type: 'int', notNull: true },
    { name: 'cost', type: 'price', notNull: true }
  ],
  primaryKey: ['company', 'sku', 'warehouse_name', 'time', 'bin'],
  indexes: [
    {
      unique: true,
      columns: ['company', 'warehouse_name', 'bin']
    }
  ],
  references: [
    {
      table: module.exports.stock,
      columns: ['company', 'sku'],
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    {
      table: 'warehouse',
      columns: ['company', 'warehouse_name:name']
    }
  ]
});

module.exports.stock_options = new Table({
  name: 'stock_options',
  columns: [
    { name: 'company', type: 'account', notNull: true },
    { name: 'sku', type: 'sku', notNull: true },
    { name: 'weight', type: 'decimal(6, 2)' },
    { name: 'length', type: 'int' },
    { name: 'width', type: 'int' },
    { name: 'height', type: 'int' }
  ]
});

module.exports.company_options = new Table({
  name: 'company_options',
  columns: [
    { name: 'company', type: 'account', notNull: true },
    { name: 'key_id', type: 'varchar(255)', notNull: true },
    { name: 'value', type: 'text' }
  ],
  primaryKey: ['company', 'key_id'],
  reducer: (acc, record) => {
    const { company, key_id, value } = record.toJSON();
    if(acc === undefined) {
      acc = {};
    }
    if(!acc[company]) {
      acc[company] = {};
    }
    acc[company][key_id] = value;
    return acc;
  }
});

module.exports.validation = new Table({
  name: 'validation',
  columns: [
    { name: 'string', validate: 'valid', notNull: true },
    { name: 'function', validate: ({ value, context, col }) => value === 'valid', notNull: true },
    { name: 'regexp', validate: /^valid$/ },
    { name: 'array', validate: ['valid1', ({ value }) => value === 'valid2', /^valid3$/], notNull: true },
    { name: 'string_null', validate: 'valid' },
    { name: 'function_null', validate: ({ value, context, col }) => value === 'valid' },
    { name: 'regexp_null', validate: /^valid$/ },
    { name: 'array_null', validate: ['valid1', ({ value }) => value === 'valid2', /^valid3$/] },
    { name: 'string_nullify', validate: 'valid', nullifyInvalid: true },
    { name: 'function_nullify', validate: ({ value, context, col }) => value === 'valid', nullifyInvalid: true },
    { name: 'regexp_nullify', validate: /^valid$/, nullifyInvalid: true },
    { name: 'array_nullify', validate: ['valid1', ({ value }) => value === 'valid2', /^valid3$/], nullifyInvalid: true }
  ]
});

