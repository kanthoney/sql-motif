'use strict';

const tables = require('./tables');

module.exports = {
  orders: tables.orders.join({
    table: tables.order_lines,
    on: ['company', 'order_id'],
    columns: [
      { name: 'line_count', calc: (table, sql) => sql`count(distinct ${table.column('lines_line_no')})`, hidden: true }
    ],
    name: 'lines',
    context: { line_no: 1 }
  }),
  inventory: tables.stock.join({
    table: tables.warehouse,
    on: {
      company: 'company'
    },
    name: 'warehouse'
  }).join({
    table: tables.warehouse_bins,
    on: ['company:warehouse_company', 'warehouse_name'],
    name: 'bin'
  }).join({
    table: tables.inventory,
    on: {
      company: 'company',
      sku: 'sku',
      bin: 'bin_bin'
    },
    type: 'left',
    alias: 'i1',
    name: 'inventory'
  }),
  inventory2: tables.stock.join({
    table: tables.warehouse.join({
      table: tables.warehouse_bins.join({
        table: tables.inventory,
        on: ['company', 'bin', 'warehouse_name']
      }),
      name: 'bins',
      on: ['company', 'warehouse_name:name']
    }),
    on: ['company', 'bins_inventory_sku:sku']
  }),
  inventory3: tables.inventory.join({
    name: 'bins',
    table: tables.warehouse_bins.join({
      table: tables.warehouse,
      on: ['company', 'name:warehouse_name']
    }),
    on: ['company', 'warehouse_name', 'bin'],
    readOnly: true
  }).join({
    table: tables.stock,
    on: ['company', 'sku'],
    readOnly: true
  }),
  stock_with_options: tables.stock.join({
    name: 'options',
    table: tables.stock_options,
    type: 'left',
    on: ['company', 'sku'],
    single: true
  })
}
