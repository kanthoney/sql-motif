'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('subquery tests', () => {

  describe('table tests', () => {

    describe('orders tests', () => {

      const t = tables.orders;

      it('should create subquery for table', () => {
        const s = t.subquery({ alias: "sq1", selector: ['company', 'delivery'], query: ({ table, selector }) => table.SelectWhere(selector, {})});
        expect(s.SelectWhere('*', { company: 'ADA001' })).toBe(
          'select "sq1"."company", "sq1"."delivery_name", "sq1"."delivery_address_company", "sq1"."delivery_address_street", "sq1"."delivery_address_locality", ' +
            '"sq1"."delivery_address_city", "sq1"."delivery_address_region", "sq1"."delivery_address_postalCode", "sq1"."delivery_address_country" ' +
            'from ( select "s1"."orders"."company", "s1"."orders"."delivery_name", "s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", ' +
            '"s1"."orders"."delivery_address_locality", "s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", ' +
            '"s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country" from "s1"."orders" where 1 = 1 ) as "sq1" ' +
            'where "sq1"."company" = \'ADA001\''
        );
      });

    });

  });

  describe('join tests', () => {

    describe('orders tests', () => {

      const t = tables.orders.subquery({
        alias: 'sq1',
        selector: ['company', 'order_id'],
        query: ({ table, selector, context }) => `${table.Select(selector)} ${table.From()} ${table.OrderBy(['company', 'order_id'])} ${table.Limit(context.from, context.limit)}`
      }).join({
        name: 'lines',
        table: tables.order_lines,
        on: ['company', 'order_id'],
        type: 'left'
      });

      it('should create select clause with subquery', () => {
        expect(t.SelectWhere('*', { company: 'AAX002' }, { context: { from: 60, limit: 20 } })).toBe(
          'select "sq1"."company", "sq1"."order_id", "ol1"."company" as "lines_company", "ol1"."order_id" as "lines_order_id", "ol1"."line_no" as "lines_line_no", ' +
            '"ol1"."sku" as "lines_sku", "ol1"."description" as "lines_description", "ol1"."qty" as "lines_qty", "ol1"."price" as "lines_price" from ' +
            '( select "s1"."orders"."company", "s1"."orders"."order_id" from "s1"."orders" order by "s1"."orders"."company" asc, "s1"."orders"."order_id" asc limit 60, 20 ) ' +
            'as "sq1" left join "order_lines" as "ol1" on "ol1"."company" = "sq1"."company" and "ol1"."order_id" = "sq1"."order_id" where "sq1"."company" = \'AAX002\''
        );
      });

    });

    describe('order lines tests', () => {
      
      const t = tables.orders.join({
        name: 'lines',
        table: tables.order_lines.join({
          name: 'inventory',
          table: tables.inventory,
          on: ['company', 'sku']
        }).subquery({
          alias: 'sq1',
          selector: '*',
          query: ({ table, selector }) => `${table.Select(selector)} ${table.From()}`
        }),
        on: ['company', 'order_id'],
        type: 'left'
      });

      it('should create a query with a subquery', () => {
        expect(t.SelectWhere('*', { company: 'ADX020' })).toBe(
          'select "s1"."orders"."company", "s1"."orders"."order_id", "s1"."orders"."order_date", "s1"."orders"."customer", "s1"."orders"."delivery_name", ' +
            '"s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", ' +
            '"s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", ' +
            '"s1"."orders"."delivery_address_country", "s1"."orders"."billing_name" as "invoice_name", "s1"."orders"."billing_address_company" as "invoice_address_company", ' +
            '"s1"."orders"."billing_address_street" as "invoice_address_street", "s1"."orders"."billing_address_locality" as "invoice_address_locality", ' +
            '"s1"."orders"."billing_address_city" as "invoice_address_city", "s1"."orders"."billing_address_region" as "invoice_address_region", ' +
            '"s1"."orders"."billing_address_postalCode" as "invoice_address_postalCode", "s1"."orders"."billing_address_country" as "invoice_address_country", ' +
            '"sq1"."company" as "lines_company", "sq1"."order_id" as "lines_order_id", "sq1"."line_no" as "lines_line_no", "sq1"."sku" as "lines_sku", ' +
            '"sq1"."description" as "lines_description", "sq1"."qty" as "lines_qty", "sq1"."price" as "lines_price", "sq1"."inventory_company" as "lines_inventory_company", ' +
            '"sq1"."inventory_sku" as "lines_inventory_sku", "sq1"."inventory_warehouse_name" as "lines_inventory_warehouse_name", "sq1"."inventory_bin" as "lines_inventory_bin", ' +
            '"sq1"."inventory_time" as "lines_inventory_time", "sq1"."inventory_qty" as "lines_inventory_qty", "sq1"."inventory_cost" as "lines_inventory_cost" ' +
            'from "s1"."orders" left join ( select "ol1"."company", "ol1"."order_id", "ol1"."line_no", "ol1"."sku", "ol1"."description", "ol1"."qty", "ol1"."price", ' +
            '"inventory"."company" as "inventory_company", "inventory"."sku" as "inventory_sku", "inventory"."warehouse_name" as "inventory_warehouse_name", ' +
            '"inventory"."bin" as "inventory_bin", "inventory"."time" as "inventory_time", "inventory"."qty" as "inventory_qty", "inventory"."cost" as "inventory_cost" ' +
            'from "order_lines" as "ol1" inner join "inventory" on "inventory"."company" = "ol1"."company" and "inventory"."sku" = "ol1"."sku" ) as "sq1" on ' +
            '"sq1"."company" = "s1"."orders"."company" and "sq1"."order_id" = "s1"."orders"."order_id" where "s1"."orders"."company" = \'ADX020\''
        );
      });

      it('should collate lines for a query with subquery', () => {
        const lines = [
          {
            company: 'AAX010',
            order_id: '6f5c0747-cf9f-4424-bf2b-e81f9946b801',
            order_date: '2020-06-23',
            customer: 'AST001',
            delivery_name: 'Mark Walbourne',
            delivery_address_company: 'Clips & Fasteners Ltd',
            delivery_address_street: '18 Featherstone St.',
            delivery_address_locality: 'Harwick',
            delivery_address_city: 'Stoke on Trent',
            delivery_address_region: 'Staffordshire',
            delivery_address_postalCode: 'ST2 8HJ',
            delivery_address_country: 'GB',
            invoice_name: 'Mark Walbourne',
            invoice_address_company: 'Clips & Fasteners Ltd',
            invoice_address_street: '18 Featherstone Street',
            invoice_address_locality: 'Harwick',
            invoice_address_city: 'Stoke on Trent',
            invoice_address_region: 'Staffordshire',
            invoice_address_postalCode: 'ST2 8HJ',
            invoice_address_country: 'GB',
            lines_company: 'AAX010',
            lines_order_id: '6f5c0747-cf9f-4424-bf2b-e81f9946b801',
            lines_line_no: 1,
            lines_sku: 'GHG001',
            lines_description: 'Hammer',
            lines_qty: 5,
            lines_price: 6.75,
            lines_inventory_company: 'AAX010',
            lines_inventory_sku: 'GHG001',
            lines_inventory_warehouse_name: 'Mercury',
            lines_inventory_time: '2019-12-14 09:18:10',
            lines_inventory_bin: 'A02A',
            lines_inventory_qty: 25,
            lines_inventory_cost: 12.14
          },
          {
            company: 'AAX010',
            order_id: '6f5c0747-cf9f-4424-bf2b-e81f9946b801',
            order_date: '2020-06-23',
            customer: 'AST001',
            delivery_name: 'Mark Walbourne',
            delivery_address_company: 'Clips & Fasteners Ltd',
            delivery_address_street: '18 Featherstone St.',
            delivery_address_locality: 'Harwick',
            delivery_address_city: 'Stoke on Trent',
            delivery_address_region: 'Staffordshire',
            delivery_address_postalCode: 'ST2 8HJ',
            delivery_address_country: 'GB',
            invoice_name: 'Mark Walbourne',
            invoice_address_company: 'Clips & Fasteners Ltd',
            invoice_address_street: '18 Featherstone Street',
            invoice_address_locality: 'Harwick',
            invoice_address_city: 'Stoke on Trent',
            invoice_address_region: 'Staffordshire',
            invoice_address_postalCode: 'ST2 8HJ',
            invoice_address_country: 'GB',
            lines_company: 'AAX010',
            lines_order_id: '6f5c0747-cf9f-4424-bf2b-e81f9946b801',
            lines_line_no: 1,
            lines_sku: 'GHG001',
            lines_description: 'Hammer',
            lines_qty: 5,
            lines_price: 6.75,
            lines_inventory_company: 'AAX010',
            lines_inventory_sku: 'GHG001',
            lines_inventory_warehouse_name: 'Mercury',
            lines_inventory_time: '2019-12-14 09:18:10',
            lines_inventory_bin: 'A12A',
            lines_inventory_qty: 25,
            lines_inventory_cost: 12.14
          },
          {
            company: 'AAX010',
            order_id: '6f5c0747-cf9f-4424-bf2b-e81f9946b801',
            order_date: '2020-06-23',
            customer: 'AST001',
            delivery_name: 'Mark Walbourne',
            delivery_address_company: 'Clips & Fasteners Ltd',
            delivery_address_street: '18 Featherstone St.',
            delivery_address_locality: 'Harwick',
            delivery_address_city: 'Stoke on Trent',
            delivery_address_region: 'Staffordshire',
            delivery_address_postalCode: 'ST2 8HJ',
            delivery_address_country: 'GB',
            invoice_name: 'Mark Walbourne',
            invoice_address_company: 'Clips & Fasteners Ltd',
            invoice_address_street: '18 Featherstone Street',
            invoice_address_locality: 'Harwick',
            invoice_address_city: 'Stoke on Trent',
            invoice_address_region: 'Staffordshire',
            invoice_address_postalCode: 'ST2 8HJ',
            invoice_address_country: 'GB',
            lines_company: 'AAX010',
            lines_order_id: '6f5c0747-cf9f-4424-bf2b-e81f9946b801',
            lines_line_no: 2,
            lines_sku: 'GHG007',
            lines_description: 'Chisel',
            lines_qty: 5,
            lines_price: 6.75,
            lines_inventory_company: 'AAX010',
            lines_inventory_sku: 'GHG007',
            lines_inventory_warehouse_name: 'Mercury',
            lines_inventory_time: '2020-02-09 12:19:09',
            lines_inventory_bin: 'A09A',
            lines_inventory_qty: 10,
            lines_inventory_cost: 12.12
          },
          {
            company: 'AAX010',
            order_id: '0094988b-0d00-4417-8d4b-c5b565abec06',
            order_date: '2020-06-23' ,
            customer: 'BAG001',
            delivery_name: 'Charlotte Green',
            delivery_address_company: 'Bags & Cases Ltd',
            delivery_address_street: '45 Windmill Road',
            delivery_address_locality: 'Prestwick',
            delivery_address_city: 'Manchester',
            delivery_address_region: '',
            delivery_address_postalCode: 'M3 8HA',
            delivery_address_country: 'GB',
            invoice_name: 'Charlotte Green',
            invoice_address_company: 'Bags & Cases Ltd',
            invoice_address_street: '45 Windmill Road',
            invoice_address_locality: 'Prestwick',
            invoice_address_city: 'Manchester',
            invoice_address_region: '',
            invoice_address_postalCode: 'M3 8HA',
            invoice_address_country: 'GB',
            lines_company: 'AAX010',
            lines_order_id: '0094988b-0d00-4417-8d4b-c5b565abec06',
            lines_line_no: 1,
            lines_sku: 'BB845',
            lines_description: 'Sewing Machine',
            lines_qty: 1,
            lines_price: 54.80,
            lines_inventory_company: 'AAX010',
            lines_inventory_sku: 'BB845',
            lines_inventory_warehouse_name: 'Highburn',
            lines_inventory_time: '2017-05-06 13:07:35',
            lines_inventory_bin: 'A14B',
            lines_inventory_qty: 10,
            lines_inventory_cost: 42.13
          }
        ];
        global.debug = true;
        expect(JSON.stringify(t.collate(lines))).toBe(
          '[{"company":"AAX010","order_id":"6f5c0747-cf9f-4424-bf2b-e81f9946b801","order_date":"2020-06-23","customer":"AST001","delivery":{"name":"Mark Walbourne",' +
            '"address":{"company":"Clips & Fasteners Ltd","street":"18 Featherstone St.","locality":"Harwick","city":"Stoke on Trent","region":"Staffordshire",' +
            '"postalCode":"ST2 8HJ","country":"GB"}},"invoice":{"name":"Mark Walbourne","address":{"company":"Clips & Fasteners Ltd","street":"18 Featherstone Street",' +
            '"locality":"Harwick","city":"Stoke on Trent","region":"Staffordshire","postalCode":"ST2 8HJ","country":"GB"}},"lines":[{"company":"AAX010",' +
            '"order_id":"6f5c0747-cf9f-4424-bf2b-e81f9946b801","line_no":1,"sku":"GHG001","description":"Hammer","qty":5,"price":6.75,' +
            '"inventory":[{"company":"AAX010","sku":"GHG001","warehouse_name":"Mercury","bin":"A02A","time":"2019-12-14 09:18:10","qty":25,"cost":12.14},' +
            '{"company":"AAX010","sku":"GHG001","warehouse_name":"Mercury","bin":"A12A","time":"2019-12-14 09:18:10","qty":25,"cost":12.14}]},' +
            '{"company":"AAX010","order_id":"6f5c0747-cf9f-4424-bf2b-e81f9946b801","line_no":2,"sku":"GHG007","description":"Chisel","qty":5,"price":6.75,' +
            '"inventory":[{"company":"AAX010","sku":"GHG007","warehouse_name":"Mercury","bin":"A09A","time":"2020-02-09 12:19:09","qty":10,"cost":12.12}]}]},' +
            '{"company":"AAX010","order_id":"0094988b-0d00-4417-8d4b-c5b565abec06","order_date":"2020-06-23","customer":"BAG001","delivery":{"name":"Charlotte Green",' +
            '"address":{"company":"Bags & Cases Ltd","street":"45 Windmill Road","locality":"Prestwick","city":"Manchester","region":"","postalCode":"M3 8HA",' +
            '"country":"GB"}},"invoice":{"name":"Charlotte Green","address":{"company":"Bags & Cases Ltd","street":"45 Windmill Road","locality":"Prestwick",' +
            '"city":"Manchester","region":"","postalCode":"M3 8HA","country":"GB"}},"lines":[{"company":"AAX010","order_id":"0094988b-0d00-4417-8d4b-c5b565abec06",' +
            '"line_no":1,"sku":"BB845","description":"Sewing Machine","qty":1,"price":54.8,"inventory":[{"company":"AAX010","sku":"BB845","warehouse_name":"Highburn",' +
            '"bin":"A14B","time":"2017-05-06 13:07:35","qty":10,"cost":42.13}]}]}]'
        );
        global.debug = false;
      });
      
    });

  });

  describe('custom join tests', () => {

    const { Table } = require('../index');
    const types = require('./types');

    const t = (new Table({
      types,
      name: 'orders',
      columns: [
        { name: 'order', type: [
          { name: 'company', type: 'account' },
          { name: 'id', type: 'id' },
          { name: 'line_no', type: 'int' }
        ], notNull: true, primaryKey: true },
        { name: 'sku', type: 'sku' }
      ]
    })).join({
      table: new Table({
        name: 'inventory',
        columns: [
          { name: 'company', type: 'account', notNull: true, primaryKey: true },
          { name: 'sku', type: 'sku', notNull: true, primaryKey: true },
          { name: 'bin', type: 'char(6)', notNull: true, primaryKey: true },
          { name: 'qty', type: 'int', notNull: true, default: 0 }
        ]
      }),
      on: ['company:order_company', 'sku']
    }).subquery({});

    it('should create subquery', () => {
      expect(t.SelectWhere('*', { inventory: { sku: 'ABA100' } })).toBe(
        'select "orders_subquery"."order_company", "orders_subquery"."order_id", "orders_subquery"."order_line_no", "orders_subquery"."sku", ' +
          '"orders_subquery"."inventory_company", "orders_subquery"."inventory_sku", "orders_subquery"."inventory_bin", "orders_subquery"."inventory_qty" from ' +
          '( select "orders"."order_company", "orders"."order_id", "orders"."order_line_no", "orders"."sku", "inventory"."company" as "inventory_company", ' +
          '"inventory"."sku" as "inventory_sku", "inventory"."bin" as "inventory_bin", "inventory"."qty" as "inventory_qty" from "orders" inner join "inventory" on ' +
          '"inventory"."company" = "orders"."order_company" and "inventory"."sku" = "orders"."sku" ) as "orders_subquery" where "orders_subquery"."inventory_sku" = \'ABA100\''
      );
    });

    it('should collate record', () => {
      const lines = [
        {
          order_company: 'HAS109',
          order_id: '319f5138-b43a-4aea-a390-ad371d08619a',
          order_line_no: 1,
          sku: 'VXJ889',
          inventory_company: 'HAS109',
          inventory_sku: 'VXJ889',
          inventory_bin: 'D14A',
          inventory_qty: 5
        },
        {
          order_company: 'HAS109',
          order_id: '319f5138-b43a-4aea-a390-ad371d08619a',
          order_line_no: 1,
          sku: 'VXJ889',
          inventory_company: 'HAS109',
          inventory_sku: 'VXJ889',
          inventory_bin: 'J13D',
          inventory_qty: 50
        },
        {
          order_company: 'HAS109',
          order_id: '319f5138-b43a-4aea-a390-ad371d08619a',
          order_line_no: 2,
          sku: 'VXJ889',
          inventory_company: 'HAS109',
          inventory_sku: 'PDD132',
          inventory_bin: 'G05B',
          inventory_qty: 23
        },
        {
          order_company: 'HAS109',
          order_id: '319f5138-b43a-4aea-a390-ad371d08619a',
          order_line_no: 2,
          sku: 'VXJ889',
          inventory_company: 'HAS109',
          inventory_sku: 'PDD132',
          inventory_bin: 'X45J',
          inventory_qty: 500
        }
      ];
      expect(JSON.stringify(t.collate(lines))).toBe(
        '[{"order":{"company":"HAS109","id":"319f5138-b43a-4aea-a390-ad371d08619a","line_no":1},"sku":"VXJ889","inventory":[{"company":"HAS109","sku":"VXJ889",' +
          '"bin":"D14A","qty":5},{"company":"HAS109","sku":"VXJ889","bin":"J13D","qty":50}]},{"order":{"company":"HAS109","id":"319f5138-b43a-4aea-a390-ad371d08619a",' +
          '"line_no":2},"sku":"VXJ889","inventory":[{"company":"HAS109","sku":"PDD132","bin":"G05B","qty":23},{"company":"HAS109","sku":"PDD132","bin":"X45J","qty":500}]}]'
      );
    });

    it('should create recordset', () => {
      const lines = [
        {
          order: {
            company: 'HAS109',
            id: '319f5138-b43a-4aea-a390-ad371d08619a',
            line_no: 1
          },
          sku: 'VXJ889',
          inventory: [{
            company: 'HAS109',
            sku: 'VXJ889',
            bin: 'D14A',
            qty: 5
          },
          {
            company: 'HAS109',
            sku: 'VXJ889',
            bin: 'J13D',
            qty: 50
          }]
        },
        {
          order: {
            company: 'HAS109',
            id: '319f5138-b43a-4aea-a390-ad371d08619a',
            line_no: 2
          },
          sku: 'VXJ889',
          inventory: [
            {
              company: 'HAS109',
              sku: 'PDD132',
              bin: 'G05B',
              qty: 23
            },
            {
              company: 'HAS109',
              sku: 'PDD132',
              bin: 'X45J',
              qty: 500
            }
          ]
        }
      ];
      expect(JSON.stringify(t.toRecordSet(lines))).toBe(
        '[{"order":{"company":"HAS109","id":"319f5138-b43a-4aea-a390-ad371d08619a","line_no":1},"sku":"VXJ889","inventory":[{"company":"HAS109","sku":"VXJ889",' +
          '"bin":"D14A","qty":5},{"company":"HAS109","sku":"VXJ889","bin":"J13D","qty":50}]},{"order":{"company":"HAS109","id":"319f5138-b43a-4aea-a390-ad371d08619a",' +
          '"line_no":2},"sku":"VXJ889","inventory":[{"company":"HAS109","sku":"PDD132","bin":"G05B","qty":23},{"company":"HAS109","sku":"PDD132","bin":"X45J","qty":500}]}]'
      );
    });

  });

  describe('nested subquery tests', () => {
    
    const types = require('./types');
    const { Table } = require('../index');

    const t = (new Table({
      name: 'orders',
      types,
      columns: [
        { name: 'id', type: 'id', notNull: true, primaryKey: true },
        { name: 'delivery', type: 'contact' },
        { name: 'billing', type: 'contact' }
      ]
    })).subquery({
      selector: '*',
      alias: 'o1',
      query: ({ selector, table, context }) => {
        context = context || {};
        const page = context.page || 1;
        const pageSize = context.pageSize || 25;
        const start = (page-1)*pageSize;
        return `${table.SelectWhere()} ${table.OrderBy('id')} ${table.Limit(start, pageSize)}`;
      }
    }).join({
      name: 'lines',
      table: new Table({
        name: 'order_lines',
        alias: 'ol1',
        columns: [
          { name: 'order_id', type: 'id', notNull: true, primaryKey: true },
          { name: 'line_no', type: 'int', notNull: true, primaryKey: true },
          { name: 'sku', type: 'sku' },
          { name: 'qty', type: 'int' }
        ]
      }),
      on: 'order_id:id'
    }).subquery({
      selector: '*',
      alias: 'o2',
      debug: true
    }).join({
      name: 'inventory',
      types,
      alias: 'i1',
      table: new Table({
        name: 'inventory',
        columns: [
          { name: 'sku', type: 'sku', notNull: true, primaryKey: true },
          { name: 'bin', type: 'bin', notNull: true, primaryKey: true },
          { name: 'qty', type: 'int' }
        ]
      }),
      on: ['sku:lines_sku']
    });

    it('should produce nested subquery', () => {
      expect(t.SelectWhere(['delivery', 'inventory'], { delivery: { address: { postalCode: 'ST14 3NJ' } }, lines: { sku: 'ADA034' } })).toBe(
        'select "o2"."delivery_name", "o2"."delivery_address_company", "o2"."delivery_address_street", "o2"."delivery_address_locality", "o2"."delivery_address_city", ' +
          '"o2"."delivery_address_region", "o2"."delivery_address_postalCode", "o2"."delivery_address_country", "i1"."sku" as "inventory_sku", "i1"."bin" as "inventory_bin", ' +
          '"i1"."qty" as "inventory_qty" from ( select "o1"."id", "o1"."delivery_name", "o1"."delivery_address_company", "o1"."delivery_address_street", ' +
          '"o1"."delivery_address_locality", "o1"."delivery_address_city", "o1"."delivery_address_region", "o1"."delivery_address_postalCode", "o1"."delivery_address_country", ' +
          '"o1"."billing_name", "o1"."billing_address_company", "o1"."billing_address_street", "o1"."billing_address_locality", "o1"."billing_address_city", ' +
          '"o1"."billing_address_region", "o1"."billing_address_postalCode", "o1"."billing_address_country", "ol1"."order_id" as "lines_order_id", ' +
          '"ol1"."line_no" as "lines_line_no", "ol1"."sku" as "lines_sku", "ol1"."qty" as "lines_qty" from ( select "orders"."id", "orders"."delivery_name", ' +
          '"orders"."delivery_address_company", "orders"."delivery_address_street", "orders"."delivery_address_locality", "orders"."delivery_address_city", ' +
          '"orders"."delivery_address_region", "orders"."delivery_address_postalCode", "orders"."delivery_address_country", "orders"."billing_name", ' +
          '"orders"."billing_address_company", "orders"."billing_address_street", "orders"."billing_address_locality", "orders"."billing_address_city", ' +
          '"orders"."billing_address_region", "orders"."billing_address_postalCode", "orders"."billing_address_country" from "orders" order by "orders"."id" ' +
          'asc limit 0, 25 ) as "o1" inner join "order_lines" as "ol1" on "ol1"."order_id" = "o1"."id" ) as "o2" inner join "inventory" as "i1" on ' +
          '"i1"."sku" = "o2"."lines_sku" where "o2"."delivery_address_postalCode" = \'ST14 3NJ\' and "o2"."lines_sku" = \'ADA034\''
      );
    });

    it('should collate lines', () => {
      const lines = [
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery_name: 'Mrs J Applegate',
          delivery_address_company: '',
          delivery_address_street: '46 Hyacinth Grove',
          delivery_address_locality: 'Beachcroft',
          delivery_address_city: 'Southend',
          delivery_address_region: '',
          delivery_address_postalCode: 'SS2 5BF',
          delivery_address_country: 'GB',
          billing_name: 'Mrs J Applegate',
          billing_address_company: '',
          billing_address_street: '46 Hyacinth Grove',
          billing_address_locality: 'Beachcroft',
          billing_address_city: 'Southend',
          billing_address_region: '',
          billing_address_postalCode: 'SS2 5BF',
          billing_address_country: 'GB',
          lines_order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          lines_line_no: 1,
          lines_sku: 'HAC022',
          lines_qty: 2,
          inventory_sku: 'HAC022',
          inventory_bin: 'AA541',
          inventory_qty: 16
        },
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery_name: 'Mrs J Applegate',
          delivery_address_company: '',
          delivery_address_street: '46 Hyacinth Grove',
          delivery_address_locality: 'Beachcroft',
          delivery_address_city: 'Southend',
          delivery_address_region: '',
          delivery_address_postalCode: 'SS2 5BF',
          delivery_address_country: 'GB',
          billing_name: 'Mrs J Applegate',
          billing_address_company: '',
          billing_address_street: '46 Hyacinth Grove',
          billing_address_locality: 'Beachcroft',
          billing_address_city: 'Southend',
          billing_address_region: '',
          billing_address_postalCode: 'SS2 5BF',
          billing_address_country: 'GB',
          lines_order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          lines_line_no: 1,
          lines_sku: 'HAC022',
          lines_qty: 2,
          inventory_sku: 'HAC022',
          inventory_bin: 'AA594',
          inventory_qty: 241
        },
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery_name: 'Mrs J Applegate',
          delivery_address_company: '',
          delivery_address_street: '46 Hyacinth Grove',
          delivery_address_locality: 'Beachcroft',
          delivery_address_city: 'Southend',
          delivery_address_region: '',
          delivery_address_postalCode: 'SS2 5BF',
          delivery_address_country: 'GB',
          billing_name: 'Mrs J Applegate',
          billing_address_company: '',
          billing_address_street: '46 Hyacinth Grove',
          billing_address_locality: 'Beachcroft',
          billing_address_city: 'Southend',
          billing_address_region: '',
          billing_address_postalCode: 'SS2 5BF',
          billing_address_country: 'GB',
          lines_order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          lines_line_no: 2,
          lines_sku: 'JBG091',
          lines_qty: 1,
          inventory_sku: 'JBG091',
          inventory_bin: 'BD053',
          inventory_qty: 12
        },
        {
          id: '8de141ae-9093-4772-8160-3ff9c176d3c7',
          delivery_name: 'Mrs P Winterbottom',
          delivery_address_company: '',
          delivery_address_street: '18 Wimbourne Road',
          delivery_address_locality: 'Smetherswick',
          delivery_address_city: 'Bristol',
          delivery_address_region: '',
          delivery_address_postalCode: 'BS1 8QT',
          delivery_address_country: 'GB',
          billing_name: 'Mrs P Winterbottom',
          billing_address_company: '',
          billing_address_street: '18 Wimbourne Road',
          billing_address_locality: 'Smetherswick',
          billing_address_city: 'Bristol',
          billing_address_region: '',
          billing_address_postalCode: 'BS1 8QT',
          billing_address_country: 'GB',
          lines_order_id: '8de141ae-9093-4772-8160-3ff9c176d3c7',
          lines_line_no: 1,
          lines_sku: 'EDF902',
          lines_qty: 1,
          inventory_sku: 'EDF902',
          inventory_bin: 'ST506',
          inventory_qty: 48
        }
      ];
      expect(JSON.stringify(t.collate(lines))).toBe(
        '[{"id":"fed8a9df-b0d6-42bd-9465-9927b60c7360","delivery":{"name":"Mrs J Applegate","address":{"company":"","street":"46 Hyacinth Grove",' +
          '"locality":"Beachcroft","city":"Southend","region":"","postalCode":"SS2 5BF","country":"GB"}},"billing":{"name":"Mrs J Applegate",' +
          '"address":{"company":"","street":"46 Hyacinth Grove","locality":"Beachcroft","city":"Southend","region":"","postalCode":"SS2 5BF","country":"GB"}},' +
          '"inventory":[{"sku":"HAC022","bin":"AA541","qty":16},{"sku":"HAC022","bin":"AA594","qty":241},{"sku":"JBG091","bin":"BD053","qty":12}],' +
          '"lines":[{"order_id":"fed8a9df-b0d6-42bd-9465-9927b60c7360","line_no":1,"sku":"HAC022","qty":2},{"order_id":"fed8a9df-b0d6-42bd-9465-9927b60c7360",' +
          '"line_no":2,"sku":"JBG091","qty":1}]},{"id":"8de141ae-9093-4772-8160-3ff9c176d3c7","delivery":{"name":"Mrs P Winterbottom","address":{"company":"",' +
          '"street":"18 Wimbourne Road","locality":"Smetherswick","city":"Bristol","region":"","postalCode":"BS1 8QT","country":"GB"}},' +
          '"billing":{"name":"Mrs P Winterbottom","address":{"company":"","street":"18 Wimbourne Road","locality":"Smetherswick","city":"Bristol",' +
          '"region":"","postalCode":"BS1 8QT","country":"GB"}},"inventory":[{"sku":"EDF902","bin":"ST506","qty":48}],' +
          '"lines":[{"order_id":"8de141ae-9093-4772-8160-3ff9c176d3c7","line_no":1,"sku":"EDF902","qty":1}]}]'
      );
    });

    it('should collate records', () => {
      const lines = [
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          billing: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          lines: {
            order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
            line_no: 1,
            sku: 'HAC022',
            qty: 2
          },
          inventory: {
            sku: 'HAC022',
            bin: 'AA541',
            qty: 16
          },
        },
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          billing: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          lines: {
            order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
            line_no: 1,
            sku: 'HAC022',
            qty: 2
          },
          inventory: {
            sku: 'HAC022',
            bin: 'AA594',
            qty: 241
          }
        },
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          billing: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          lines: {
            order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
            line_no: 2,
            sku: 'JBG091',
            qty: 1
          },
          inventory: {
            sku: 'JBG091',
            bin: 'BD053',
            qty: 12
          }
        },
        {
          id: '8de141ae-9093-4772-8160-3ff9c176d3c7',
          delivery: {
            name: 'Mrs P Winterbottom',
            address: {
              company: '',
              street: '18 Wimbourne Road',
              locality: 'Smetherswick',
              city: 'Bristol',
              region: '',
              postalCode: 'BS1 8QT',
              country: 'GB',
            }
          },
          billing: {
            name: 'Mrs P Winterbottom',
            address: {
              company: '',
              street: '18 Wimbourne Road',
              locality: 'Smetherswick',
              city: 'Bristol',
              region: '',
              postalCode: 'BS1 8QT',
              country: 'GB'
            }
          },
          lines: {
            order_id: '8de141ae-9093-4772-8160-3ff9c176d3c7',
            line_no: 1,
            sku: 'EDF902',
            qty: 1
          },
          inventory: {
            sku: 'EDF902',
            bin: 'ST506',
            qty: 48
          }
        }
      ];
      expect(JSON.stringify(t.toRecordSet(lines))).toBe(
        '[{"id":"fed8a9df-b0d6-42bd-9465-9927b60c7360","delivery":{"name":"Mrs J Applegate","address":{"company":"","street":"46 Hyacinth Grove",' +
          '"locality":"Beachcroft","city":"Southend","region":"","postalCode":"SS2 5BF","country":"GB"}},"billing":{"name":"Mrs J Applegate",' +
          '"address":{"company":"","street":"46 Hyacinth Grove","locality":"Beachcroft","city":"Southend","region":"","postalCode":"SS2 5BF","country":"GB"}},' +
          '"inventory":[{"sku":"HAC022","bin":"AA541","qty":16},{"sku":"HAC022","bin":"AA594","qty":241},{"sku":"JBG091","bin":"BD053","qty":12}],' +
          '"lines":[{"order_id":"fed8a9df-b0d6-42bd-9465-9927b60c7360","line_no":1,"sku":"HAC022","qty":2},{"order_id":"fed8a9df-b0d6-42bd-9465-9927b60c7360",' +
          '"line_no":2,"sku":"JBG091","qty":1}]},{"id":"8de141ae-9093-4772-8160-3ff9c176d3c7","delivery":{"name":"Mrs P Winterbottom","address":{"company":"",' +
          '"street":"18 Wimbourne Road","locality":"Smetherswick","city":"Bristol","region":"","postalCode":"BS1 8QT","country":"GB"}},' +
          '"billing":{"name":"Mrs P Winterbottom","address":{"company":"","street":"18 Wimbourne Road","locality":"Smetherswick","city":"Bristol",' +
          '"region":"","postalCode":"BS1 8QT","country":"GB"}},"inventory":[{"sku":"EDF902","bin":"ST506","qty":48}],' +
          '"lines":[{"order_id":"8de141ae-9093-4772-8160-3ff9c176d3c7","line_no":1,"sku":"EDF902","qty":1}]}]'
      );
    });

    it('should add records', () => {
      const lines = [
        {
          id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
          delivery: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          billing: {
            name: 'Mrs J Applegate',
            address: {
              company: '',
              street: '46 Hyacinth Grove',
              locality: 'Beachcroft',
              city: 'Southend',
              region: '',
              postalCode: 'SS2 5BF',
              country: 'GB'
            }
          },
          lines: [
            {
              order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
              line_no: 1,
              sku: 'HAC022',
              qty: 2
            },
            {
              order_id: 'fed8a9df-b0d6-42bd-9465-9927b60c7360',
              line_no: 2,
              sku: 'JBG091',
              qty: 1
            }
          ],
          inventory: [
            {
              sku: 'HAC022',
              bin: 'AA541',
              qty: 16
            },
            {
              sku: 'HAC022',
              bin: 'AA594',
              qty: 241
            },
            {
              sku: 'JBG091',
              bin: 'BD053',
              qty: 12
            }
          ]
        },
        {
          id: '8de141ae-9093-4772-8160-3ff9c176d3c7',
          delivery: {
            name: 'Mrs P Winterbottom',
            address: {
              company: '',
              street: '18 Wimbourne Road',
              locality: 'Smetherswick',
              city: 'Bristol',
              region: '',
              postalCode: 'BS1 8QT',
              country: 'GB',
            }
          },
          billing: {
            name: 'Mrs P Winterbottom',
            address: {
              company: '',
              street: '18 Wimbourne Road',
              locality: 'Smetherswick',
              city: 'Bristol',
              region: '',
              postalCode: 'BS1 8QT',
              country: 'GB'
            }
          },
          lines: {
            order_id: '8de141ae-9093-4772-8160-3ff9c176d3c7',
            line_no: 1,
            sku: 'EDF902',
            qty: 1
          },
          inventory: {
            sku: 'EDF902',
            bin: 'ST506',
            qty: 48
          }
        }
      ];
      expect(JSON.stringify(t.toRecordSet(lines))).toBe(
        '[{"id":"fed8a9df-b0d6-42bd-9465-9927b60c7360","delivery":{"name":"Mrs J Applegate","address":{"company":"","street":"46 Hyacinth Grove",' +
          '"locality":"Beachcroft","city":"Southend","region":"","postalCode":"SS2 5BF","country":"GB"}},"billing":{"name":"Mrs J Applegate",' +
          '"address":{"company":"","street":"46 Hyacinth Grove","locality":"Beachcroft","city":"Southend","region":"","postalCode":"SS2 5BF","country":"GB"}},' +
          '"inventory":[{"sku":"HAC022","bin":"AA541","qty":16},{"sku":"HAC022","bin":"AA594","qty":241},{"sku":"JBG091","bin":"BD053","qty":12}],' +
          '"lines":[{"order_id":"fed8a9df-b0d6-42bd-9465-9927b60c7360","line_no":1,"sku":"HAC022","qty":2},{"order_id":"fed8a9df-b0d6-42bd-9465-9927b60c7360",' +
          '"line_no":2,"sku":"JBG091","qty":1}]},{"id":"8de141ae-9093-4772-8160-3ff9c176d3c7","delivery":{"name":"Mrs P Winterbottom","address":{"company":"",' +
          '"street":"18 Wimbourne Road","locality":"Smetherswick","city":"Bristol","region":"","postalCode":"BS1 8QT","country":"GB"}},' +
          '"billing":{"name":"Mrs P Winterbottom","address":{"company":"","street":"18 Wimbourne Road","locality":"Smetherswick","city":"Bristol",' +
          '"region":"","postalCode":"BS1 8QT","country":"GB"}},"inventory":[{"sku":"EDF902","bin":"ST506","qty":48}],' +
          '"lines":[{"order_id":"8de141ae-9093-4772-8160-3ff9c176d3c7","line_no":1,"sku":"EDF902","qty":1}]}]'
      );
    });

  });

});

