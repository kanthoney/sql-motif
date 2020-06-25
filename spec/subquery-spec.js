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

});

