'use strict';

const types = require('./types');

module.exports = (name, dialect, db) => {

  const {
    Table,
    Verbatim,
    DateTime,
    Fn,
    Identifier,
    Operator
  } = require('../index')({ dialect, types });

  const tables = {};
  const joins = {};

  tables.stock = new Table({
    name: 'stock',
    columns: [
      { name: 'company', type: 'account', notNull: true },
      { name: 'sku', type: 'sku', notNull: true },
      { name: 'description', type: 'text' },
      { name: 'cost', type: 'price' }
    ],
    primaryKey: ['company', 'sku']
  });

  tables.orders = new Table({
    name: 'orders',
    columns: [
      { name: 'company', type: 'account', notNull: true, primaryKey: true },
      { name: 'order_id', type: 'uuid', notNull: true, primaryKey: true },
      { name: 'order_date', type: 'date', notNull: true },
      { name: 'delivery', type: 'contact' },
      { name: 'invoice', type: 'invoice' }
    ]
  });

  tables.order_lines = new Table({
    name: 'order_lines',
    columns: [
      { name: 'company', type: 'account', nouNull: true, primaryKey: true },
      { name: 'order_id', type: 'uuid', notNull: true, primaryKey: true },
      { name: 'line_no', type: 'int', notNull: true, primaryKey: true },
      { name: 'sku', type: 'sku', notNull: true },
      { name: 'description', type: 'text' },
      { name: 'qty', type: 'qty', notNull: true },
      { name: 'price', type: 'price', notNull: true }
    ],
    references: [{
      table: tables.orders,
      columns: ['company', 'order_id']
    },
    {
      table: tables.stock,
      columns: ['company', 'sku']
    }]
  });

  joins.orders = tables.orders.join({
    name: 'lines',
    table: tables.order_lines.join({
      table: tables.stock,
      name: 'stock',
      readOnly: true,
      on: ['company', 'sku']
    }),
    on: ['company', 'order_id']
  }).extend({
    columns: [
      { name: 'count', hidden: true, calc: (col, sql) => sql`count(distinct ${col})` }
    ]
  });

  describe(`Database tests for ${name}`, () => {

    it("should create tables", async done => {
      await Promise.all(Object.keys(tables).map(k => db.query(tables[k].Create())));
      expect(await db.query(joins.orders.SelectWhere())).toEqual([]);
      expect(await db.query(`${joins.orders.SelectWhere(['@orders', 'count'])} ${joins.orders.GroupBy()}`));
      const sample_stock = require('./sample-stock.json');
      expect(await(db.query(tables.stock.InsertIgnore(sample_stock)))).toEqual([]);
      const sample_orders = require('./sample-orders.json');
      const validated = joins.orders.validate(sample_orders);
      expect(validated.valid).toBe(true);
      done();
    });
  });

}
