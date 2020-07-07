'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('view specs', () => {

  describe('orders tests', () => {

    const v1 = tables.orders.view({
      name: 'order_delivery_addresses',
      schema: 'views',
      columns: [ { name: 'count', calc: 'count(*)' } ],
      selector: ['company', 'order_id', { delivery: { address: true } }, 'count']
    });

    const v2 = tables.orders.view({
      name: 'delivery_addresses',
      selector: [{ delivery: { address: true } }],
      query: ({ table, selector }) => `select distinct ${table.selectWhere(selector)}`
    });

    it('should produce create view statement with default query', () => {
      expect(v1.Create()).toBe(
        'create view "views"."order_delivery_addresses" as select "s1"."orders"."company", "s1"."orders"."order_id", "s1"."orders"."delivery_address_company", ' +
          '"s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", "s1"."orders"."delivery_address_city", ' +
          '"s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country", count(*) as "count" from "s1"."orders"'
      );
    });

    it('should produce create view statement from specified query', () => {
      expect(v2.Create()).toBe(
        'create view "s1"."delivery_addresses" as select distinct "s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", ' +
          '"s1"."orders"."delivery_address_locality", "s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", ' +
          '"s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country" from "s1"."orders"'
      );
    });

    it('should collate lines from view', () => {

      const lines = [
        {
          company: 'ADA101',
          order_id: '6ad90c6c-c39c-48cd-8d0b-dd7cf7169e0f',
          delivery_address_company: 'Mitchell Brothers Ltd',
          delivery_address_street: '18 St James Street',
          delivery_address_locality: 'Cockleford',
          delivery_address_city: 'Stafford',
          delivery_address_region: '',
          delivery_address_postalCode: 'ST18 7TS',
          delivery_address_country: 'GB'
        },
        {
          company: 'ADA101',
          order_id: '09d5c57f-0546-4e5b-bd41-074e6356e46b',
          delivery_address_company: 'Mitchell Brothers Ltd',
          delivery_address_street: '18 St James Street',
          delivery_address_locality: 'Cockleford',
          delivery_address_city: 'Stafford',
          delivery_address_region: '',
          delivery_address_postalCode: 'ST18 7TS',
          delivery_address_country: 'GB'
        },
        {
          company: 'ADA101',
          order_id: 'e53a0ca5-be43-46cb-9bf4-b74aeac7c562',
          delivery_address_company: '',
          delivery_address_street: '42 Warner Grove',
          delivery_address_locality: '',
          delivery_address_city: 'Leicester',
          delivery_address_region: '',
          delivery_address_postalCode: 'LE3 5GQ',
          delivery_address_country: 'GB'          
        }
      ];

      expect(JSON.stringify(v1.collate(lines))).toBe(
        '[{"company":"ADA101","order_id":"6ad90c6c-c39c-48cd-8d0b-dd7cf7169e0f","delivery":{"address":{"company":"Mitchell Brothers Ltd","street":"18 St James Street",' +
          '"locality":"Cockleford","city":"Stafford","region":"","postalCode":"ST18 7TS","country":"GB"}}},{"company":"ADA101","order_id":"09d5c57f-0546-4e5b-bd41-074e6356e46b",' +
          '"delivery":{"address":{"company":"Mitchell Brothers Ltd","street":"18 St James Street","locality":"Cockleford","city":"Stafford","region":"","postalCode":"ST18 7TS",' +
          '"country":"GB"}}},{"company":"ADA101","order_id":"e53a0ca5-be43-46cb-9bf4-b74aeac7c562","delivery":{"address":{"company":"","street":"42 Warner Grove","locality":"",' +
          '"city":"Leicester","region":"","postalCode":"LE3 5GQ","country":"GB"}}}]'
      );
      
    });

    it('should collate records for view', () => {

      const records = [
        {
          company: 'ADA101',
          order_id: '6ad90c6c-c39c-48cd-8d0b-dd7cf7169e0f',
          delivery: {
            address: {
              company: 'Mitchell Brothers Ltd',
              street: '18 St James Street',
              locality: 'Cockleford',
              city: 'Stafford',
              region: '',
              postalCode: 'ST18 7TS',
              country: 'GB'
            }
          }
        },
        {
          company: 'ADA101',
          order_id: '09d5c57f-0546-4e5b-bd41-074e6356e46b',
          delivery: {
            address: {
              company: 'Mitchell Brothers Ltd',
              street: '18 St James Street',
              locality: 'Cockleford',
              city: 'Stafford',
              region: '',
              postalCode: 'ST18 7TS',
              country: 'GB'
            }
          }
        },
        {
          company: 'ADA101',
          order_id: 'e53a0ca5-be43-46cb-9bf4-b74aeac7c562',
          delivery: {
            address: {
              company: '',
              street: '42 Warner Grove',
              locality: '',
              city: 'Leicester',
              region: '',
              postalCode: 'LE3 5GQ',
              country: 'GB'
            }
          }
        }
      ];

      expect(JSON.stringify(v1.toRecordSet(records))).toBe(
        '[{"company":"ADA101","order_id":"6ad90c6c-c39c-48cd-8d0b-dd7cf7169e0f","delivery":{"address":{"company":"Mitchell Brothers Ltd","street":"18 St James Street",' +
          '"locality":"Cockleford","city":"Stafford","region":"","postalCode":"ST18 7TS","country":"GB"}}},{"company":"ADA101","order_id":"09d5c57f-0546-4e5b-bd41-074e6356e46b",' +
          '"delivery":{"address":{"company":"Mitchell Brothers Ltd","street":"18 St James Street","locality":"Cockleford","city":"Stafford","region":"","postalCode":"ST18 7TS",' +
          '"country":"GB"}}},{"company":"ADA101","order_id":"e53a0ca5-be43-46cb-9bf4-b74aeac7c562","delivery":{"address":{"company":"","street":"42 Warner Grove","locality":"",' +
          '"city":"Leicester","region":"","postalCode":"LE3 5GQ","country":"GB"}}}]'
      );

    });

  });

  describe('inventory2 tests', () => {
    
    const v1 = joins.inventory2.view({
      name: 'stock_bins',
      selector: ['company', 'sku', { warehouse: [ 'name', { bins: 'bin' } ] }]
    });

    it('should create view with default query', () => {
      expect(v1.Create()).toBe(
        'create view "stock_bins" as select "stock"."company", "stock"."sku", "w1"."name" as "warehouse_name", "warehouse_bins"."bin" as "warehouse_bins_bin" from ' +
        '"stock" inner join ("s1"."warehouse" as "w1" inner join ("warehouse_bins" inner join "inventory" on "inventory"."company" = "warehouse_bins"."company" and ' +
        '"inventory"."bin" = "warehouse_bins"."bin" and "inventory"."warehouse_name" = "warehouse_bins"."warehouse_name" and "inventory"."sku" = "stock"."sku") on ' +
        '"warehouse_bins"."company" = "w1"."company" and "warehouse_bins"."warehouse_name" = "w1"."name") on "w1"."company" = "stock"."company"'
      );
    });

    it('should collate sql result', () => {

      const lines = [
        {
          company: 'ASH102',
          sku: 'GNG958',
          warehouse_name: 'Mercury',
          warehouse_bins_bin: 'HA45A'
        },
        {
          company: 'ASH102',
          sku: 'GNG958',
          warehouse_name: 'Mercury',
          warehouse_bins_bin: 'T56S'
        },
        {
          company: 'ASH102',
          sku: 'GNG958',
          warehouse_name: 'Gemini',
          warehouse_bins_bin: 'HA45A'
        }
      ];

      expect(JSON.stringify(v1.collate(lines))).toBe(
        '[{"company":"ASH102","sku":"GNG958","warehouse":[{"company":"ASH102","name":"Mercury","bins":[{"company":"ASH102","warehouse_name":"Mercury","bin":"HA45A"},' +
          '{"company":"ASH102","warehouse_name":"Mercury","bin":"T56S"}]},{"company":"ASH102","name":"Gemini","bins":[{"company":"ASH102",' +
          '"warehouse_name":"Gemini","bin":"HA45A"}]}]}]'
      );

    });

    it('should collate records', () => {

      const records = [
        {
          company: 'ASH102',
          sku: 'GNG958',
          warehouse: {
            name: 'Mercury',
            bins: {
              bin: 'HA45A'
            }
          }
        },
        {
          company: 'ASH102',
          sku: 'GNG958',
          warehouse: {
            name: 'Mercury',
            bins: {
              bin: 'T56S'
            }
          }
        },
        {
          company: 'ASH102',
          sku: 'GNG958',
          warehouse: {
            name: 'Gemini',
            bins: {
              bin: 'HA45A'
            }
          }
        }
      ];

      expect(JSON.stringify(v1.toRecordSet(records))).toBe(
        '[{"company":"ASH102","sku":"GNG958","warehouse":[{"company":"ASH102","name":"Mercury","bins":[{"company":"ASH102","warehouse_name":"Mercury","bin":"HA45A"},' +
          '{"company":"ASH102","warehouse_name":"Mercury","bin":"T56S"}]},{"company":"ASH102","name":"Gemini","bins":[{"company":"ASH102",' +
          '"warehouse_name":"Gemini","bin":"HA45A"}]}]}]'
      );

    });

  });

  describe('view and subquery specs', () => {

    const { Table } = require('../index');

    const table = (new Table({
      name: 'orders',
      columns: [
        { name: 'id', type: 'id', primaryKey: true }
      ]
    }).join({
      name: 'lines',
      table: {
        name: 'order_lines',
        columns: [
          { name: 'order_id', type: 'id', primaryKey: true },
          { name: 'line_no', type: 'int', primaryKey: true }
        ]
      },
      on: ['order_id:id']
    }).view({
      name: 'orders_with_lines'
    }).subquery({
      alias: 'sq1'
    }));

    it('should collate lines', () => {
      const lines = [
        {
          id: 'a0668fb0-b912-4545-bd72-d9aabf78799d',
          lines_order_id: 'a0668fb0-b912-4545-bd72-d9aabf78799d',
          lines_line_no: 1
        }
      ];
     expect(JSON.stringify(table.collate(lines))).toBe(
        '[{"id":"a0668fb0-b912-4545-bd72-d9aabf78799d","lines":[{"order_id":"a0668fb0-b912-4545-bd72-d9aabf78799d","line_no":1}]}]'
      );
    });

  });

});

