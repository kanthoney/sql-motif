'use strict';

const types = require('./types');
const uuid = require('uuid');

module.exports = (name, dialect, db) => {

  const {
    Table,
    Verbatim,
    DateTime,
    Fn,
    Identifier,
    Operator,
    operators
  } = require('../index')({ dialect, types });

  const tables = {};
  const joins = {};

  tables.stock = new Table({
    name: 'stock',
    columns: [
      { name: 'company', type: 'account', notNull: true },
      { name: 'sku', type: 'sku', notNull: true },
      { name: 'description', type: 'text' },
      { name: 'cost', type: 'price' },
      { name: 'count', calc: 'count(*)', hidden: true }
    ],
    primaryKey: ['company', 'sku']
  });

  tables.orders = new Table({
    name: 'orders',
    columns: [
      { name: 'company', type: 'account', notNull: true, primaryKey: true },
      { name: 'order_id', type: 'uuid', notNull: true, primaryKey: true, default: () => uuid.v4() },
      { name: 'order_date', type: 'date', notNull: true },
      { name: 'customer', type: 'account', notNull: true },
      { name: 'delivery', type: 'contact' },
      { name: 'invoice', type: 'contact' },
      { name: 'count', calc: 'count(*)', alias: 'order_count', hidden: true }
    ],
    indexes: {
      columns: ['company', 'customer']
    }
  });

  tables.order_lines = new Table({
    name: 'order_lines',
    columns: [
      { name: 'company', type: 'account', nouNull: true, primaryKey: true },
      { name: 'order_id', type: 'uuid', notNull: true, primaryKey: true },
      { name: 'line_no', type: 'int', notNull: true, primaryKey: true, default: (col, context) => context.line_no++ },
      { name: 'sku', type: 'sku', notNull: true },
      { name: 'description', type: 'text' },
      { name: 'qty', type: 'qty', notNull: true },
      { name: 'price', type: 'price', notNull: true },
      { name: 'count', calc: 'count(*)', hidden: true }
    ],
    context: value => ({ line_no: value.reduce((acc, record) => Math.max((record.get('line_no') || 0) + 1, acc), 1) }),
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
  });

  describe(`Database tests for ${name}`, () => {

    it("should create tables and insert records, perform basic tests then delete order records", async done => {
      await Promise.all(Object.keys(tables).map(k => db.query(tables[k].Create())));
      expect(await db.query(joins.orders.SelectWhere())).toEqual([]);
      const sample_stock = require('./sample-stock.json');
      expect(await(db.query(tables.stock.Insert(sample_stock)))).toEqual([]);
      expect((await(db.query(tables.stock.SelectWhere('count'))))[0].count).toBe(20);
      const sample_orders = require('./sample-orders.json');
      let records = joins.orders.validate(sample_orders);
      expect(records.valid).toBe(false);
      records = records.fill(sample_orders);
      records = records.validate();
      expect(records.valid).toBe(true);
      await db.query(records.InsertIgnore());
      await db.query(records.Update());
      expect((await(db.query(tables.orders.SelectWhere('order_count'))))[0]['order_count']).toBe(1413);
      expect((await(db.query(tables.order_lines.SelectWhere('count'))))[0]['count']).toBe(1938);
      const big_orders = records.filter(record => record.get('lines').length > 3);
      expect(big_orders.valid).toBe(true);
      const order_id = big_orders.get('[0].order_id');
      let lines = await db.query(joins.orders.SelectWhere('*', { order_id }));
      expect(JSON.stringify(joins.orders.collate(lines))).toBe(
        `[{"company":"AAD010","order_id":"${order_id}","order_date":"2020-04-23","customer":"BFV46","delivery":{"name":"Mrs Maureen Francis",` +
        `"address":{"company":"Kingsbury Ltd","street":"22 Longmoor Road","locality":"Bedbury Business Park","city":"Birmingham","region":"","postalCode":"B1 6LD","country":"GB"}},` +
        `"invoice":{"name":"Mrs Maureen Francis","address":{"company":"Kingsbury Ltd","street":"22 Longmoor Road","locality":"Bedbury Business Park","city":"Birmingham","region":"",` +
        `"postalCode":"B1 6LD","country":"GB"}},"lines":[{"company":"AAD010","order_id":"${order_id}","line_no":1,"sku":"EON46NX","description":"Hammer","qty":7,` +
        `"price":15.11,"stock":[{"company":"AAD010","sku":"EON46NX","description":"Hammer","cost":9.07}]},{"company":"AAD010","order_id":"${order_id}","line_no":2,` +
        `"sku":"CKB40KL","description":"Hand brush","qty":50,"price":10.82,"stock":[{"company":"AAD010","sku":"CKB40KL","description":"Hand brush","cost":8.42}]},{"company":"AAD010",` +
        `"order_id":"${order_id}","line_no":3,"sku":"QBE99BI","description":"Chisel","qty":1,"price":7.85,"stock":[{"company":"AAD010","sku":"QBE99BI",` +
        `"description":"Chisel","cost":6.27}]},{"company":"AAD010","order_id":"${order_id}","line_no":4,"sku":"DKP27VM","description":"Box of nails",` +
        `"qty":6,"price":3.64,"stock":[{"company":"AAD010","sku":"DKP27VM","description":"Box of nails","cost":2.33}]}]}]`
      );
      lines = await db.query(joins.orders.SelectWhere('*', { customer: operators.gt('ZX') } ));
      expect(joins.orders.collate(lines).length).toBe(7);
      lines = await db.query(joins.orders.SelectWhere('*', { customer: operators.between('F', 'H') } ));
      expect(joins.orders.collate(lines).length).toBe(103);
      lines = await db.query(joins.orders.SelectWhere('*', { customer: [operators.between('F', 'H'), operators.between('R', 'S')], lines: { sku: ['HCY61KQ', 'DKP27VM'] } } ));
      expect(joins.orders.collate(lines).length).toBe(16);
      lines = await db.query(joins.orders.SelectWhere('*', { customer: operators.between('A', 'E'), lines: { sku: 'WFN86XT' } }));
      expect(joins.orders.collate(lines).length).toBe(14);
      const toDelete = records.slice(0, 800);
      await db.query(toDelete.Delete());
      expect((await(db.query(tables.orders.SelectWhere('order_count'))))[0]['order_count']).toBe(613);
      expect((await(db.query(tables.order_lines.SelectWhere('count'))))[0]['count']).toBe(868);
      await db.query(records.Delete());
      expect((await(db.query(tables.orders.SelectWhere('order_count'))))[0]['order_count']).toBe(0);
      expect((await(db.query(tables.order_lines.SelectWhere('count'))))[0]['count']).toBe(0);
      expect((await(db.query(tables.stock.SelectWhere('count'))))[0].count).toBe(20);
      done();
    });
  });

}
