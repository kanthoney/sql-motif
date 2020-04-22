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
      { name: 'cost', type: 'price' },
      { name: 'count', calc: 'count(*)', hidden: true }
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
      { name: 'invoice', type: 'contact' },
      { name: 'count', calc: 'count(*)', alias: 'order_count', hidden: true }
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
      { name: 'price', type: 'price', notNull: true },
      { name: 'count', calc: 'count(*)', hidden: true }
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
  });

  describe(`Database tests for ${name}`, () => {

    it("should create tables and insert records, perform basic tests then delete order records", async done => {
      await Promise.all(Object.keys(tables).map(k => db.query(tables[k].Create())));
      expect(await db.query(joins.orders.SelectWhere())).toEqual([]);
      const sample_stock = require('./sample-stock.json');
      expect(await(db.query(tables.stock.Insert(sample_stock)))).toEqual([]);
      expect((await(db.query(tables.stock.SelectWhere('count'))))[0].count).toBe(20);
      const sample_orders = require('./sample-orders.json');
      const validated = joins.orders.validate(sample_orders);
      expect(validated.valid).toBe(true);
      await db.query(validated.InsertIgnore());
      await db.query(validated.Update());
      expect((await(db.query(tables.orders.SelectWhere('order_count'))))[0]['order_count']).toBe(1498);
      expect((await(db.query(tables.order_lines.SelectWhere('count'))))[0]['count']).toBe(2036);
      let lines = await db.query(joins.orders.SelectWhere('*', { order_id: '85a75945-0911-4e57-939d-329caea82809' }));
      expect(JSON.stringify(joins.orders.collate(lines))).toBe(
        '[{"company":"AAD010","order_id":"85a75945-0911-4e57-939d-329caea82809","order_date":"2020-04-20","delivery":{"name":"Liam Wood","address":{"company":"HJ&M PLC",' +
        '"street":"12 Harrier Avenue","locality":"","city":"Newcastle-upon-Tyne","region":"","postalCode":"NE3 9RD","country":"GB"}},"invoice":{"name":"Ms Louise Smith",' +
        '"address":{"company":"","street":"17 Baker Avenue","locality":"","city":"Liverpool","region":"","postalCode":"L13 5PU","country":"GB"}},' +
        '"lines":[{"company":"AAD010","order_id":"85a75945-0911-4e57-939d-329caea82809","line_no":1,"sku":"SSJ5NJ","description":"Hand brush","qty":200,"price":5.64,' +
        '"stock":[{"company":"AAD010","sku":"SSJ5NJ","description":"Hand brush","cost":3.78}]},{"company":"AAD010","order_id":"85a75945-0911-4e57-939d-329caea82809",' +
        '"line_no":2,"sku":"MAB29FX","description":"Hammer","qty":2,"price":7.05,"stock":[{"company":"AAD010","sku":"MAB29FX","description":"Hammer","cost":4.84}]}]}]'
      );
      const toDelete = joins.orders.toRecordSet(sample_orders.slice(0, 800));
      await db.query(toDelete.Delete());
      expect((await(db.query(tables.orders.SelectWhere('order_count'))))[0]['order_count']).toBe(698);
      expect((await(db.query(tables.order_lines.SelectWhere('count'))))[0]['count']).toBe(924);
      await db.query(validated.Delete());
      expect((await(db.query(tables.orders.SelectWhere('order_count'))))[0]['order_count']).toBe(0);
      expect((await(db.query(tables.stock.SelectWhere('count'))))[0].count).toBe(20);
      expect((await(db.query(tables.order_lines.SelectWhere('count'))))[0]['count']).toBe(0);
      done();
    });
  });

}
