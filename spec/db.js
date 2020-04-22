'use strict';

const types = require('./types');

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
      { name: 'order_id', type: 'uuid', notNull: true, primaryKey: true },
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
        '[{"company":"AAD010","order_id":"85a75945-0911-4e57-939d-329caea82809","order_date":"2020-04-20","customer":"RJR54","delivery":{"name":"Liam Wood",' +
        '"address":{"company":"HJ&M PLC","street":"12 Harrier Avenue","locality":"","city":"Newcastle-upon-Tyne","region":"","postalCode":"NE3 9RD","country":"GB"}},' +
        '"invoice":{"name":"Ms Louise Smith","address":{"company":"","street":"17 Baker Avenue","locality":"","city":"Liverpool","region":"","postalCode":"L13 5PU","country":"GB"}},' +
        '"lines":[{"company":"AAD010","order_id":"85a75945-0911-4e57-939d-329caea82809","line_no":1,"sku":"SSJ5NJ","description":"Hand brush","qty":200,"price":5.64,' +
        '"stock":[{"company":"AAD010","sku":"SSJ5NJ","description":"Hand brush","cost":3.78}]},{"company":"AAD010","order_id":"85a75945-0911-4e57-939d-329caea82809","line_no":2,' +
        '"sku":"MAB29FX","description":"Hammer","qty":2,"price":7.05,"stock":[{"company":"AAD010","sku":"MAB29FX","description":"Hammer","cost":4.84}]}]}]'
      );
      lines = await db.query(joins.orders.SelectWhere('*', { customer: operators.gt('ZX') } ));
      expect(JSON.stringify(joins.orders.collate(lines))).toBe(
        '[{"company":"AAD010","order_id":"148e109c-3c30-4066-a808-fb1a8efc5960","order_date":"2020-04-19","customer":"ZYK45","delivery":{"name":"Michael Jackson",' +
        '"address":{"company":"Kingsbury PLC","street":"14 Dove Avenue","locality":"","city":"Liverpool","region":"","postalCode":"L3 10BG","country":"GB"}},' +
        '"invoice":{"name":"Michael Jackson","address":{"company":"Kingsbury PLC","street":"14 Dove Avenue","locality":"","city":"Liverpool","region":"","postalCode":"L3 10BG",' +
        '"country":"GB"}},"lines":[{"company":"AAD010","order_id":"148e109c-3c30-4066-a808-fb1a8efc5960","line_no":1,"sku":"VJB7PU","description":"Screwdriver","qty":1,"price":9.57,' +
        '"stock":[{"company":"AAD010","sku":"VJB7PU","description":"Screwdriver","cost":7.09}]}]},{"company":"AAD010","order_id":"7c0a282e-b446-404c-9eb6-1169bcb43f33",' +
        '"order_date":"2020-04-21","customer":"ZZO60","delivery":{"name":"Scott Jackson","address":{"company":"Chingford PLC","street":"7 Whitworth Street","locality":"Bedbury Business Park",' +
        '"city":"Leicester","region":"","postalCode":"LE11 11PA","country":"GB"}},"invoice":{"name":"Scott Jackson","address":{"company":"Chingford PLC","street":"7 Whitworth Street",' +
        '"locality":"Bedbury Business Park","city":"Leicester","region":"","postalCode":"LE11 11PA","country":"GB"}},"lines":[{"company":"AAD010","order_id":"7c0a282e-b446-404c-9eb6-1169bcb43f33",' +
        '"line_no":1,"sku":"BRP50IS","description":"Plastic pipe","qty":50,"price":30.25,"stock":[{"company":"AAD010","sku":"BRP50IS","description":"Plastic pipe","cost":19.88}]},' +
        '{"company":"AAD010","order_id":"7c0a282e-b446-404c-9eb6-1169bcb43f33","line_no":2,"sku":"SWP32YC","description":"Spirit level","qty":0,"price":8.88,' +
        '"stock":[{"company":"AAD010","sku":"SWP32YC","description":"Spirit level","cost":6.08}]}]},{"company":"AAD010","order_id":"ad928b46-53c8-44cd-9151-013689f45d58",' +
        '"order_date":"2020-04-21","customer":"ZZU21","delivery":{"name":"Dr Liam Snowdon","address":{"company":"Caltech Limited","street":"31 Derby Street","locality":"",' +
        '"city":"Warrington","region":"","postalCode":"WA3 8GB","country":"GB"}},"invoice":{"name":"Dr Liam Snowdon","address":{"company":"Caltech Limited",' +
        '"street":"31 Derby Street","locality":"","city":"Warrington","region":"","postalCode":"WA3 8GB","country":"GB"}},"lines":[{"company":"AAD010",' +
        '"order_id":"ad928b46-53c8-44cd-9151-013689f45d58","line_no":1,"sku":"XCS6EB","description":"Square","qty":20,"price":27.19,"stock":[{"company":"AAD010","sku":"XCS6EB",' +
        '"description":"Square","cost":20.33}]},{"company":"AAD010","order_id":"ad928b46-53c8-44cd-9151-013689f45d58","line_no":2,"sku":"VRU10WU","description":"Box of nails",' +
        '"qty":20,"price":14.04,"stock":[{"company":"AAD010","sku":"VRU10WU","description":"Box of nails","cost":11.21}]},{"company":"AAD010","order_id":"ad928b46-53c8-44cd-9151-013689f45d58",' +
        '"line_no":3,"sku":"MAB29FX","description":"Hammer","qty":50,"price":7.66,"stock":[{"company":"AAD010","sku":"MAB29FX","description":"Hammer","cost":4.84}]},' +
        '{"company":"AAD010","order_id":"ad928b46-53c8-44cd-9151-013689f45d58","line_no":4,"sku":"HCT47AB","description":"Hacksaw","qty":20,"price":36.64,' +
        '"stock":[{"company":"AAD010","sku":"HCT47AB","description":"Hacksaw","cost":24.01}]}]},{"company":"AAD010","order_id":"1c53f998-fde4-44c8-9666-be824d043cff",' +
        '"order_date":"2020-04-21","customer":"ZYL51","delivery":{"name":"Ms Jenny Snowdon","address":{"company":"Kingsbury Limited","street":"15 Longmoor Close","locality":"Welbury",' +
        '"city":"Glasgow","region":"","postalCode":"G8 8BQ","country":"GB"}},"invoice":{"name":"Ms Jenny Snowdon","address":{"company":"Kingsbury Limited",' +
        '"street":"15 Longmoor Close","locality":"Welbury","city":"Glasgow","region":"","postalCode":"G8 8BQ","country":"GB"}},"lines":[{"company":"AAD010",' +
        '"order_id":"1c53f998-fde4-44c8-9666-be824d043cff","line_no":1,"sku":"FFB89AE","description":"Soldering iron","qty":20,"price":2.98,"stock":[{"company":"AAD010","sku":"FFB89AE",' +
        '"description":"Soldering iron","cost":2.29}]},{"company":"AAD010","order_id":"1c53f998-fde4-44c8-9666-be824d043cff","line_no":2,"sku":"NJJ38OX","description":"Spade",' +
        '"qty":200,"price":7.51,"stock":[{"company":"AAD010","sku":"NJJ38OX","description":"Spade","cost":5.19}]},{"company":"AAD010","order_id":"1c53f998-fde4-44c8-9666-be824d043cff",' +
        '"line_no":3,"sku":"BPI9ME","description":"Saw","qty":20,"price":28.74,"stock":[{"company":"AAD010","sku":"BPI9ME","description":"Saw","cost":21.43}]},{"company":"AAD010",' +
        '"order_id":"1c53f998-fde4-44c8-9666-be824d043cff","line_no":4,"sku":"YCV81CL","description":"Chisel","qty":3,"price":13.98,"stock":[{"company":"AAD010","sku":"YCV81CL",' +
        '"description":"Chisel","cost":9.76}]},{"company":"AAD010","order_id":"1c53f998-fde4-44c8-9666-be824d043cff","line_no":5,"sku":"BRP50IS","description":"Plastic pipe",' +
        '"qty":200,"price":30.23,"stock":[{"company":"AAD010","sku":"BRP50IS","description":"Plastic pipe","cost":19.88}]}]},{"company":"AAD010","order_id":' +
        '"29e2138a-d3c3-4dc2-9ddb-50894640e460","order_date":"2020-04-21","customer":"ZZQ99","delivery":{"name":"Charlotte Duggan","address":{"company":"","street":"16 Dove Road",' +
        '"locality":"Bedfield","city":"Manchester","region":"","postalCode":"M6 1GE","country":"GB"}},"invoice":{"name":"Ken Williams","address":{"company":"Hardware 4U Limited",' +
        '"street":"18 Whitworth Close","locality":"Greenford Park","city":"Manchester","region":"","postalCode":"M11 11GR","country":"GB"}},"lines":[{"company":"AAD010",' +
        '"order_id":"29e2138a-d3c3-4dc2-9ddb-50894640e460","line_no":1,"sku":"VJA51TJ","description":"Spanner","qty":4,"price":8.35,"stock":[{"company":"AAD010","sku":"VJA51TJ",' +
        '"description":"Spanner","cost":6.22}]}]},{"company":"AAD010","order_id":"444f4b5a-9aea-4f4e-9f72-439e1955b1e8","order_date":"2020-04-20","customer":"ZZQ25",' +
        '"delivery":{"name":"Ms Elizabeth Black","address":{"company":"","street":"8 Teddington Road","locality":"","city":"Glasgow","region":"","postalCode":"G7 11NG","country":"GB"}},' +
        '"invoice":{"name":"Edward Armstrong","address":{"company":"","street":"16 Highfield Street","locality":"Greenford","city":"Stockport","region":"","postalCode":"SK5 4TO","country":"GB"}},' +
        '"lines":[{"company":"AAD010","order_id":"444f4b5a-9aea-4f4e-9f72-439e1955b1e8","line_no":1,"sku":"RWM36EP","description":"Rake","qty":1,"price":12.8,' +
        '"stock":[{"company":"AAD010","sku":"RWM36EP","description":"Rake","cost":8.4}]}]}]'
      );
      expect(joins.orders.collate(lines).toJSON().length).toBe(6);
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
