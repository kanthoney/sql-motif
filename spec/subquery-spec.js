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
          'select "sq1"."company", "sq1"."order_id", "ol1"."company" as "lines_company", "ol1"."order_id" as "lines_order_id", ' +
            '"ol1"."line_no" as "lines_line_no", "ol1"."sku" as "lines_sku", "ol1"."description" as "lines_description", ' +
            '"ol1"."qty" as "lines_qty", "ol1"."price" as "lines_price" from ( select "s1"."orders"."company", "s1"."orders"."order_id" ' +
            'from "s1"."orders" order by "s1"."orders"."company" asc, "s1"."orders"."order_id" asc limit 60, 20 ) as "sq1" left join "order_lines" as "ol1" on ' +
            '"ol1"."company" = "sq1"."company" and "ol1"."order_id" = "sq1"."order_id" where "sq1"."company" = \'AAX002\''
        );
      });

    });

    describe('order lines tests', () => {
      
      const t = tables.orders.join({
        name: 'lines',
        table: tables.order_lines.join({
          name: 'skus',
          table: tables.stock,
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
            '"sq1"."description" as "lines_description", "sq1"."qty" as "lines_qty", "sq1"."price" as "lines_price", "sq1"."skus_company" as "lines_skus_company", ' +
            '"sq1"."skus_sku" as "lines_skus_sku", "sq1"."skus_description" as "lines_skus_description" from "s1"."orders" left join ( select "ol1"."company", ' +
            '"ol1"."order_id", "ol1"."line_no", "ol1"."sku", "ol1"."description", "ol1"."qty", "ol1"."price", "stock"."company" as "skus_company", ' +
            '"stock"."sku" as "skus_sku", "stock"."description" as "skus_description" from "order_lines" as "ol1" inner join "stock" on ' +
            '"stock"."company" = "ol1"."company" and "stock"."sku" = "ol1"."sku" ) as "sq1" on "sq1"."company" = "s1"."orders"."company" and ' +
            '"sq1"."order_id" = "s1"."orders"."order_id" where "s1"."orders"."company" = \'ADX020\''
        );
      });

      fit('should collate lines for a query with subquery', () => {
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
            lines_skus_company: 'AAX010',
            lines_skus_sku: 'GHG001',
            lines_sku_description: 'Hammer'
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
            lines_skus_company: 'AAX010',
            lines_skus_sku: 'GHG007',
            lines_sku_description: 'Chisel'
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
            lines_skus_company: 'AAX010',
            lines_skus_sku: 'BB845',
            lines_sku_description: 'Sewing Machine'
          }
        ];
        console.log(JSON.stringify(t.collate(lines)));
      });
      
    });

  });

});

