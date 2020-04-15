'use strict';

const tables = require('./tables');
const joins = require('./joins');
const RecordSet = require('../src/recordset');

describe("record set tests", () => {

  describe("table tests", () => {

    describe("orders tests", () => {

      const t = tables.orders;
      const lines = [
        {
          company: 'ABE081',
          order_id: 12,
          order_date: '2020-04-13',
          customer: 'TET001',
          delivery_name: 'Terry Test',
          delivery_address_company: '',
          delivery_address_street: '12 Whitfield Road',
          delivery_address_locality: '',
          delivery_address_city: 'Birmingham',
          delivery_address_region: '',
          delivery_address_postalCode: 'B15 8JX',
          delivery_address_country: 'GB',
          invoice_name: 'Terry Test',
          invoice_address_company: '',
          invoice_address_street: '12 Whitfield Road',
          invoice_address_locality: '',
          invoice_address_city: 'Birmingham',
          invoice_address_region: '',
          invoice_address_postalCode: 'B15 8JX',
          invoice_address_country: 'GB',
        },
        {
          company: 'ABE081',
          order_id: 13,
          order_date: '2020-04-13',
          customer: 'TAT001',
          delivery_name: 'Tabitha Trial',
          delivery_address_company: '',
          delivery_address_street: '14 Whitfield Road',
          delivery_address_locality: '',
          delivery_address_city: 'Birmingham',
          delivery_address_region: '',
          delivery_address_postalCode: 'B15 8JX',
          delivery_address_country: 'GB',
          invoice_name: 'Terry Test',
          invoice_address_company: '',
          invoice_address_street: '12 Whitfield Road',
          invoice_address_locality: '',
          invoice_address_city: 'Birmingham',
          invoice_address_region: '',
          invoice_address_postalCode: 'B15 8JX',
          invoice_address_country: 'GB',
        }
      ];

      it('should import order records', () => {
        const r = new RecordSet(t);
        r.addSQLResult(lines);
        expect(r.toJSON()).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}}},{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001",' +
          '"delivery":{"name":"Tabitha Trial","address":{"company":"","street":"14 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
          '"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}}}]'
        );
      });

    });

  });

  describe('join tests', () => {

    describe('orders join tests', () => {

      const j = joins.orders;
      const lines = [
        {
          company: 'ABE081',
          order_id: 12,
          order_date: '2020-04-13',
          customer: 'TET001',
          delivery_name: 'Terry Test',
          delivery_address_company: '',
          delivery_address_street: '12 Whitfield Road',
          delivery_address_locality: '',
          delivery_address_city: 'Birmingham',
          delivery_address_region: '',
          delivery_address_postalCode: 'B15 8JX',
          delivery_address_country: 'GB',
          invoice_name: 'Terry Test',
          invoice_address_company: '',
          invoice_address_street: '12 Whitfield Road',
          invoice_address_locality: '',
          invoice_address_city: 'Birmingham',
          invoice_address_region: '',
          invoice_address_postalCode: 'B15 8JX',
          invoice_address_country: 'GB',
          lines_company: 'ABE081',
          lines_order_id: 12,
          lines_line_no: 1,
          lines_sku: 'ABA001',
          lines_description: 'Widget',
          lines_qty: 1,
          lines_price: 4.32
        },
        {
          company: 'ABE081',
          order_id: 12,
          order_date: '2020-04-13',
          customer: 'TET001',
          delivery_name: 'Terry Test',
          delivery_address_company: '',
          delivery_address_street: '12 Whitfield Road',
          delivery_address_locality: '',
          delivery_address_city: 'Birmingham',
          delivery_address_region: '',
          delivery_address_postalCode: 'B15 8JX',
          delivery_address_country: 'GB',
          invoice_name: 'Terry Test',
          invoice_address_company: '',
          invoice_address_street: '12 Whitfield Road',
          invoice_address_locality: '',
          invoice_address_city: 'Birmingham',
          invoice_address_region: '',
          invoice_address_postalCode: 'B15 8JX',
          invoice_address_country: 'GB',
          lines_company: 'ABE081',
          lines_order_id: 12,
          lines_line_no: 2,
          lines_sku: 'ABJ994',
          lines_description: 'Gadget',
          lines_qty: 100,
          lines_price: 8.94
        },
        {
          company: 'ABE081',
          order_id: 13,
          order_date: '2020-04-13',
          customer: 'TAT001',
          delivery_name: 'Tabitha Trial',
          delivery_address_company: '',
          delivery_address_street: '14 Whitfield Road',
          delivery_address_locality: '',
          delivery_address_city: 'Birmingham',
          delivery_address_region: '',
          delivery_address_postalCode: 'B15 8JX',
          delivery_address_country: 'GB',
          invoice_name: 'Terry Test',
          invoice_address_company: '',
          invoice_address_street: '12 Whitfield Road',
          invoice_address_locality: '',
          invoice_address_city: 'Birmingham',
          invoice_address_region: '',
          invoice_address_postalCode: 'B15 8JX',
          invoice_address_country: 'GB',
          lines_company: 'ABE081',
          lines_order_id: 13,
          lines_line_no: 1,
          lines_sku: 'ABJ994',
          lines_description: 'Gadget',
          lines_qty: 100,
          lines_price: 8.94
        },
        {
          company: 'ANE131',
          order_id: 14,
          order_date: '2020-04-13',
          customer: 'THT001',
          delivery_name: 'Thomas Test',
          delivery_address_company: '',
          delivery_address_street: '18 Whitfield Road',
          delivery_address_locality: '',
          delivery_address_city: 'Birmingham',
          delivery_address_region: '',
          delivery_address_postalCode: 'B15 8JX',
          delivery_address_country: 'GB',
          invoice_name: 'Thomas Test',
          invoice_address_company: '',
          invoice_address_street: '18 Whitfield Road',
          invoice_address_locality: '',
          invoice_address_city: 'Birmingham',
          invoice_address_region: '',
          invoice_address_postalCode: 'B15 8JX',
          invoice_address_country: 'GB',
          lines_company: null,
          lines_order_id: null,
          lines_line_no: null,
          lines_sku: null,
          lines_description: null,
          lines_qty: null,
          lines_price: null
        }
      ];

      it('should collate order lines', () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(r.toJSON()).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001",' +
          '"description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,"line_no":2,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]},' +
          '{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial","address":{"company":"","street":"14 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994",' +
          '"description":"Gadget","qty":100,"price":8.94}]},{"company":"ANE131","order_id":14,"order_date":"2020-04-13","customer":"THT001","delivery":{"name":"Thomas Test",' +
          '"address":{"company":"","street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Thomas Test",' +
          '"address":{"company":"","street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[]}]'
        );
      });

    });

    describe('inventory tests', () => {

      const j = joins.inventory;
      const lines = [
        {
          company: 'HJ8009',
          sku: 'JFX192',
          description: 'gadget',
          warehouse_company: 'HJ9009',
          warehouse_name: 'mercury',
          warehouse_description: '',
          warehouse_address_company: 'H&J Ltd',
          warehouse_address_street: '16 Hatfield court',
          warehouse_address_locality: 'Chester Industrial Estate',
          warehouse_address_city: 'Manchester',
          warehouse_address_region: '',
          warehouse_address_postalCode: 'M8 9EF',
          warehouse_address_country: 'GB',
          bin_company: 'HJ8009',
          bin_warehouse_name: 'mercury',
          bin_bin: 'A15D2',
          inventory_company: 'HJ8009',
          inventory_sku: 'JFX192',
          inventory_warehouse: 'mercury',
          inventory_bin: 'A15D2',
          inventory_time: '2020-04-13 12:45:31',
          inventory_qty: 7,
          inventory_cost: 6.32
        },
        {
          company: 'HJ8009',
          sku: 'JFX192',
          description: 'gadget',
          warehouse_company: 'HJ9009',
          warehouse_name: 'mercury',
          warehouse_description: '',
          warehouse_address_company: 'H&J Ltd',
          warehouse_address_street: '16 Hatfield court',
          warehouse_address_locality: 'Chester Industrial Estate',
          warehouse_address_city: 'Manchester',
          warehouse_address_region: '',
          warehouse_address_postalCode: 'M8 9EF',
          warehouse_address_country: 'GB',
          bin_company: 'HJ8009',
          bin_warehouse_name: 'mercury',
          bin_bin: 'A15D2',
          inventory_company: 'HJ8009',
          inventory_sku: 'JFX192',
          inventory_warehouse: 'mercury',
          inventory_bin: 'A15D2',
          inventory_time: '2019-10-20 15:09:12',
          inventory_qty: 800,
          inventory_cost: 6.32
        },
        {
          company: 'HJ8009',
          sku: 'JFX192',
          description: 'gadget',
          warehouse_company: 'HJ9009',
          warehouse_name: 'mercury',
          warehouse_description: '',
          warehouse_address_company: 'H&J Ltd',
          warehouse_address_street: '16 Hatfield court',
          warehouse_address_locality: 'Chester Industrial Estate',
          warehouse_address_city: 'Manchester',
          warehouse_address_region: '',
          warehouse_address_postalCode: 'M8 9EF',
          warehouse_address_country: 'GB',
          bin_company: 'HJ8009',
          bin_warehouse_name: 'mercury',
          bin_bin: 'A15D2',
          inventory_company: 'HJ8009',
          inventory_sku: 'JFX192',
          inventory_warehouse: 'mercury',
          inventory_bin: 'A15D2',
          inventory_time: '2019-03-09 08:15:42',
          inventory_qty: 7,
          inventory_cost: 6.32
        },
        {
          company: 'HJ8009',
          sku: 'JFX192',
          description: 'gadget',
          warehouse_company: 'HJ9009',
          warehouse_name: 'mercury',
          warehouse_description: '',
          warehouse_address_company: 'H&J Ltd',
          warehouse_address_street: '16 Hatfield court',
          warehouse_address_locality: 'Chester Industrial Estate',
          warehouse_address_city: 'Manchester',
          warehouse_address_region: '',
          warehouse_address_postalCode: 'M8 9EF',
          warehouse_address_country: 'GB',
          bin_company: 'HJ8009',
          bin_warehouse_name: 'mercury',
          bin_bin: 'B09A6',
          inventory_company: 'HJ8009',
          inventory_sku: 'JFX192',
          inventory_warehouse: 'mercury',
          inventory_bin: 'B09A6',
          inventory_time: '2017-06-14 11:21:09',
          inventory_qty: 600,
          inventory_cost: 5.14
        }
      ];

      it('should collate inventory lines', () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(r.toJSON()).toBe(
          '[{"company":"HJ8009","sku":"JFX192","description":"gadget","warehouse":[{"company":"HJ9009","name":"mercury","description":"","address":{"company":"H&J Ltd",' +
          '"street":"16 Hatfield court","locality":"Chester Industrial Estate","city":"Manchester","region":"","postalCode":"M8 9EF","country":"GB"}}],"bin":[{"company":"HJ8009",' +
          '"warehouse_name":"mercury","bin":"A15D2"},{"company":"HJ8009","warehouse_name":"mercury","bin":"B09A6"}],"inventory":[{"company":"HJ8009","sku":"JFX192","bin":"A15D2",' +
          '"time":"2020-04-13 12:45:31","qty":7,"cost":6.32},{"company":"HJ8009","sku":"JFX192","bin":"A15D2","time":"2019-10-20 15:09:12","qty":800,"cost":6.32},' +
          '{"company":"HJ8009","sku":"JFX192","bin":"A15D2","time":"2019-03-09 08:15:42","qty":7,"cost":6.32},{"company":"HJ8009","sku":"JFX192","bin":"B09A6",' +
          '"time":"2017-06-14 11:21:09","qty":600,"cost":5.14}]}]'
        );
      });

    });

    describe('inventory2 tests', () => {

      const j = joins.inventory2;
      const lines = [
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Chesterfield',
          warehouse_description: 'grotty',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'FA76D2',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'FA76D2',
          warehouse_bins_inventory_time: '2019-06-14 09:12:54',
          warehouse_bins_inventory_qty: 5,
          warehouse_bins_inventory_price: 98.34
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Chesterfield',
          warehouse_description: 'grotty',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'GA15A3',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'GA15A3',
          warehouse_bins_inventory_time: '2019-04-30 11:32:19',
          warehouse_bins_inventory_qty: 20,
          warehouse_bins_inventory_price: 96.41
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Chesterfield',
          warehouse_description: 'grotty',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'FA76D2',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'FA76D2',
          warehouse_bins_inventory_time: '2019-07-16 13:16:29',
          warehouse_bins_inventory_qty: 40,
          warehouse_bins_inventory_price: 95.32
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Chesterfield',
          warehouse_description: 'grotty',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'FA76D2',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'FA76D2',
          warehouse_bins_inventory_time: '2019-06-14 09:12:54',
          warehouse_bins_inventory_qty: 5,
          warehouse_bins_inventory_price: 98.34
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Wolverhampton',
          warehouse_description: 'even grottier',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Wolverhampton',
          warehouse_bins_bin: 'J16X',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'J16X',
          warehouse_bins_inventory_time: '2020-02-12 08:55:19',
          warehouse_bins_inventory_qty: 200,
          warehouse_bins_inventory_price: 84.96
        },
        {
          company: 'ANA191',
          sku: 'DX678',
          description: 'Chisel',
          warehouse_company: 'ANA191',
          warehouse_name: 'Telford',
          warehouse_description: 'quite nice but small',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Telford',
          warehouse_bins_bin: 'H78D',
          warehouse_bins_inventory_sku: null,
          warehouse_bins_inventory_bin: null,
          warehouse_bins_inventory_time: null,
          warehouse_bins_inventory_qty: null,
          warehouse_bins_inventory_price: null
        }
      ];

      it("should collate lines for inventory2", () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(r.toJSON()).toBe(
          '[{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[{"company":"ANA191","name":"Chesterfield","description":"grotty",' +
          '"bins":[{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"sku":"DX676","bin":"FA76D2","time":"2019-06-14 09:12:54","qty":5},' +
          '{"sku":"DX676","bin":"FA76D2","time":"2019-07-16 13:16:29","qty":40}]},{"company":"ANA191","warehouse_name":"Chesterfield","bin":"GA15A3",' +
          '"inventory":[{"sku":"DX676","bin":"GA15A3","time":"2019-04-30 11:32:19","qty":20}]}]},{"company":"ANA191","name":"Wolverhampton","description":"even grottier",' +
          '"bins":[{"company":"ANA191","warehouse_name":"Wolverhampton","bin":"J16X","inventory":[{"sku":"DX676","bin":"J16X","time":"2020-02-12 08:55:19","qty":200}]}]}]},' +
          '{"company":"ANA191","sku":"DX678","description":"Chisel","warehouse":[{"company":"ANA191","name":"Telford","description":"quite nice but small",' +
          '"bins":[{"company":"ANA191","warehouse_name":"Telford","bin":"H78D","inventory":[]}]}]}]'
        );
      });

    });

  });

});
