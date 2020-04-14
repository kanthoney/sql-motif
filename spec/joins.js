'use strict';

const tables = require('./tables');

module.exports = {
  orders: tables.orders.join({
    table: tables.order_lines,
    on: ['company', 'order_id'],
    name: 'lines'
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
  })
}
