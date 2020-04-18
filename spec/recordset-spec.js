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
        expect(JSON.stringify(r)).toBe(
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

      it('should collate order lines', () => {
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
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001",' +
          '"description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,"line_no":2,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]},' +
          '{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial","address":{"company":"","street":"14 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994",' +
          '"description":"Gadget","qty":100,"price":8.94}]},{"company":"ANE131","order_id":14,"order_date":"2020-04-13","customer":"THT001",' +
          '"delivery":{"name":"Thomas Test","address":{"company":"","street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
          '"invoice":{"name":"Thomas Test","address":{"company":"","street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[]}]'
        );
      });

      it("should cope with null main table fields as in right join", () => {
        const lines = [
          {
            company: null,
            order_id: null,
            order_date: null,
            customer: null,
            delivery_name: null,
            delivery_address_company: null,
            delivery_address_street: null,
            delivery_address_locality: null,
            delivery_address_city: null,
            delivery_address_region: null,
            delivery_address_postalCode: null,
            delivery_address_country: null,
            invoice_name: null,
            invoice_address_company: null,
            invoice_address_street: null,
            invoice_address_locality: null,
            invoice_address_city: null,
            invoice_address_region: null,
            invoice_address_postalCode: null,
            invoice_address_country: null,
            lines_company: 'ABE081',
            lines_order_id: 12,
            lines_line_no: 1,
            lines_sku: 'ABA001',
            lines_description: 'Widget',
            lines_qty: 1,
            lines_price: 4.32
          },
          {
            company: null,
            order_id: null,
            order_date: null,
            customer: null,
            delivery_name: null,
            delivery_address_company: null,
            delivery_address_street: null,
            delivery_address_locality: null,
            delivery_address_city: null,
            delivery_address_region: null,
            delivery_address_postalCode: null,
            delivery_address_country: null,
            invoice_name: null,
            invoice_address_company: null,
            invoice_address_street: null,
            invoice_address_locality: null,
            invoice_address_city: null,
            invoice_address_region: null,
            invoice_address_postalCode: null,
            invoice_address_country: null,
            lines_company: 'ABE081',
            lines_order_id: 12,
            lines_line_no: 2,
            lines_sku: 'ABJ994',
            lines_description: 'Gadget',
            lines_qty: 100,
            lines_price: 8.94
          },
          {
            company: null,
            order_id: null,
            order_date: null,
            customer: null,
            delivery_name: null,
            delivery_address_company: null,
            delivery_address_street: null,
            delivery_address_locality: null,
            delivery_address_city: null,
            delivery_address_region: null,
            delivery_address_postalCode: null,
            delivery_address_country: null,
            invoice_name: null,
            invoice_address_company: null,
            invoice_address_street: null,
            invoice_address_locality: null,
            invoice_address_city: null,
            invoice_address_region: null,
            invoice_address_postalCode: null,
            invoice_address_country: null,
            lines_company: 'ABE081',
            lines_order_id: 13,
            lines_line_no: 1,
            lines_sku: 'ABJ994',
            lines_description: 'Gadget',
            lines_qty: 100,
            lines_price: 8.94
          }
        ];
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r)).toBe(
          '[{"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,"line_no":2,' +
          '"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94},{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]}]'
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
        expect(JSON.stringify(r)).toBe(
          '[{"company":"HJ8009","sku":"JFX192","description":"gadget","warehouse":[{"company":"HJ9009","name":"mercury","description":"","address":{"company":"H&J Ltd",' +
          '"street":"16 Hatfield court","locality":"Chester Industrial Estate","city":"Manchester","region":"","postalCode":"M8 9EF","country":"GB"}}],' +
          '"bin":[{"company":"HJ8009","warehouse_name":"mercury","bin":"A15D2"},{"company":"HJ8009","warehouse_name":"mercury","bin":"B09A6"}],' +
          '"inventory":[{"company":"HJ8009","sku":"JFX192","bin":"A15D2","time":"2020-04-13 12:45:31","qty":7,"cost":6.32},{"company":"HJ8009","sku":"JFX192","bin":"A15D2",' +
          '"time":"2019-10-20 15:09:12","qty":800,"cost":6.32},{"company":"HJ8009","sku":"JFX192","bin":"A15D2","time":"2019-03-09 08:15:42","qty":7,"cost":6.32},' +
          '{"company":"HJ8009","sku":"JFX192","bin":"B09A6","time":"2017-06-14 11:21:09","qty":600,"cost":5.14}]}]'
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
          warehouse_address_company: 'Tools 4 U Ltd',
          warehouse_address_street: '29 Sudbury Lane',
          warehouse_address_locality: '',
          warehouse_address_city: 'Chesterfield',
          warehouse_address_region: 'Derbyshire',
          warehouse_address_postalCode: 'S40 9DS',
          warehouse_address_country: 'GB',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'FA76D2',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'FA76D2',
          warehouse_bins_inventory_time: '2019-06-14 09:12:54',
          warehouse_bins_inventory_qty: 5,
          warehouse_bins_inventory_cost: 98.34
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Chesterfield',
          warehouse_description: 'grotty',
          warehouse_address_company: 'Tools 4 U Ltd',
          warehouse_address_street: '29 Sudbury Lane',
          warehouse_address_locality: '',
          warehouse_address_city: 'Chesterfield',
          warehouse_address_region: 'Derbyshire',
          warehouse_address_postalCode: 'S40 9DS',
          warehouse_address_country: 'GB',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'GA15A3',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'GA15A3',
          warehouse_bins_inventory_time: '2019-04-30 11:32:19',
          warehouse_bins_inventory_qty: 20,
          warehouse_bins_inventory_cost: 96.41
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
          warehouse_address_company: 'Tools 4 U Ltd',
          warehouse_address_street: '29 Sudbury Lane',
          warehouse_address_locality: '',
          warehouse_address_city: 'Chesterfield',
          warehouse_address_region: 'Derbyshire',
          warehouse_address_postalCode: 'S40 9DS',
          warehouse_address_country: 'GB',
          warehouse_bins_bin: 'FA76D2',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'FA76D2',
          warehouse_bins_inventory_time: '2019-07-16 13:16:29',
          warehouse_bins_inventory_qty: 40,
          warehouse_bins_inventory_cost: 95.32
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Chesterfield',
          warehouse_description: 'grotty',
          warehouse_address_company: 'Tools 4 U Ltd',
          warehouse_address_street: '29 Sudbury Lane',
          warehouse_address_locality: '',
          warehouse_address_city: 'Chesterfield',
          warehouse_address_region: 'Derbyshire',
          warehouse_address_postalCode: 'S40 9DS',
          warehouse_address_country: 'GB',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Chesterfield',
          warehouse_bins_bin: 'FA76D2',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'FA76D2',
          warehouse_bins_inventory_time: '2019-06-14 09:12:54',
          warehouse_bins_inventory_qty: 5,
          warehouse_bins_inventory_cost: 98.34
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse_company: 'ANA191',
          warehouse_name: 'Wolverhampton',
          warehouse_description: 'even grottier',
          warehouse_bins_company: 'ANA191',
          warehouse_address_company: 'Hammer Time Ltd',
          warehouse_address_street: '45 Strawberry St',
          warehouse_address_locality: '',
          warehouse_address_city: 'Wolverhampton',
          warehouse_address_region: 'West Midlands',
          warehouse_address_postalCode: 'WV17 9JK',
          warehouse_address_country: 'GB',
          warehouse_bins_warehouse_name: 'Wolverhampton',
          warehouse_bins_bin: 'J16X',
          warehouse_bins_inventory_sku: 'DX676',
          warehouse_bins_inventory_bin: 'J16X',
          warehouse_bins_inventory_time: '2020-02-12 08:55:19',
          warehouse_bins_inventory_qty: 200,
          warehouse_bins_inventory_cost: 84.96
        },
        {
          company: 'ANA191',
          sku: 'DX678',
          description: 'Chisel',
          warehouse_company: 'ANA191',
          warehouse_name: 'Telford',
          warehouse_description: 'quite nice but small',
          warehouse_address_company: 'Chisels Unlimited Ltd',
          warehouse_address_street: '16 Shrewsbury St',
          warehouse_address_locality: 'Victoria Business Park',
          warehouse_address_city: 'Telford',
          warehouse_address_region: 'Shropshire',
          warehouse_address_postalCode: 'TF2 8XD',
          warehouse_address_country: 'GB',
          warehouse_bins_company: 'ANA191',
          warehouse_bins_warehouse_name: 'Telford',
          warehouse_bins_bin: 'H78D',
          warehouse_bins_inventory_sku: null,
          warehouse_bins_inventory_bin: null,
          warehouse_bins_inventory_time: null,
          warehouse_bins_inventory_qty: null,
          warehouse_bins_inventory_cost: null
        }
      ];

      it("should collate lines for inventory2", () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r.get('[0].warehouse[0].bins[0]'))).toBe(
          '{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2",' +
          '"time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2","time":"2019-07-16 13:16:29","qty":40,"cost":95.32}]}'
        );
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[{"company":"ANA191","name":"Chesterfield","description":"grotty",' +
          '"address":{"company":"Tools 4 U Ltd","street":"29 Sudbury Lane","locality":"","city":"Chesterfield","region":"Derbyshire","postalCode":"S40 9DS","country":"GB"},' +
          '"bins":[{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2",' +
          '"time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2","time":"2019-07-16 13:16:29",' +
          '"qty":40,"cost":95.32}]},{"company":"ANA191","warehouse_name":"Chesterfield","bin":"GA15A3","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield",' +
          '"bin":"GA15A3","time":"2019-04-30 11:32:19","qty":20,"cost":96.41}]}]},{"company":"ANA191","name":"Wolverhampton","description":"even grottier",' +
          '"address":{"company":"Hammer Time Ltd","street":"45 Strawberry St","locality":"","city":"Wolverhampton","region":"West Midlands","postalCode":"WV17 9JK","country":"GB"},' +
          '"bins":[{"company":"ANA191","warehouse_name":"Wolverhampton","bin":"J16X","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Wolverhampton","bin":"J16X",' +
          '"time":"2020-02-12 08:55:19","qty":200,"cost":84.96}]}]}]},{"company":"ANA191","sku":"DX678","description":"Chisel","warehouse":[{"company":"ANA191","name":"Telford",' +
          '"description":"quite nice but small","address":{"company":"Chisels Unlimited Ltd","street":"16 Shrewsbury St","locality":"Victoria Business Park","city":"Telford",' +
          '"region":"Shropshire","postalCode":"TF2 8XD","country":"GB"},"bins":[{"company":"ANA191","warehouse_name":"Telford","bin":"H78D","inventory":[]}]}]}]'
        );
        expect(JSON.stringify(j.validate(r))).toBe(
          '{"results":[{"record":{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[{"company":"ANA191","name":"Chesterfield","description":"grotty",' +
          '"address":{"company":"Tools 4 U Ltd","street":"29 Sudbury Lane","locality":"","city":"Chesterfield","region":"Derbyshire","postalCode":"S40 9DS","country":"GB"},' +
          '"bins":[{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2",' +
          '"time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2","time":"2019-07-16 13:16:29","qty":40,"cost":95.32}]},' +
          '{"company":"ANA191","warehouse_name":"Chesterfield","bin":"GA15A3","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"GA15A3",' +
          '"time":"2019-04-30 11:32:19","qty":20,"cost":96.41}]}]},{"company":"ANA191","name":"Wolverhampton","description":"even grottier","address":{"company":"Hammer Time Ltd",' +
          '"street":"45 Strawberry St","locality":"","city":"Wolverhampton","region":"West Midlands","postalCode":"WV17 9JK","country":"GB"},"bins":[{"company":"ANA191",' +
          '"warehouse_name":"Wolverhampton","bin":"J16X","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Wolverhampton","bin":"J16X","time":"2020-02-12 08:55:19",' +
          '"qty":200,"cost":84.96}]}]}]},"valid":true,"errors":{}},{"record":{"company":"ANA191","sku":"DX678","description":"Chisel","warehouse":[{"company":"ANA191","name":"Telford",' +
          '"description":"quite nice but small","address":{"company":"Chisels Unlimited Ltd","street":"16 Shrewsbury St","locality":"Victoria Business Park","city":"Telford",' +
          '"region":"Shropshire","postalCode":"TF2 8XD","country":"GB"},"bins":[{"company":"ANA191","warehouse_name":"Telford","bin":"H78D","inventory":[]}]}]},' +
          '"valid":true,"errors":{}}],"valid":true}'
        );
      });

    });

  });

});
