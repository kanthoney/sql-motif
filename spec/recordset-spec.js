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

      const data = [
        {
          company: 'ABE081',
          order_id: 12,
          order_date: '2020-04-13',
          customer: 'TET001',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '12 Whitfield Road',
              locality: '',
              city: 'Birmingham',
              region: '',
              postalCode: 'B15 8JX',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '12 Whitfield Road',
              locality: '',
              city: 'Birmingham',
              region: '',
              postalCode: 'B15 8JX',
              country: 'GB'
            }
          },
        },
        {
          company: 'ABE081',
          order_id: 13,
          order_date: '2020-04-13',
          customer: 'TAT001',
          delivery: {
            name: 'Tabitha Trial',
            address: {
              company: '',
              street: '14 Whitfield Road',
              locality: '',
              city: 'Birmingham',
              region: '',
              postalCode: 'B15 8JX',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '12 Whitfield Road',
              locality: '',
              city: 'Birmingham',
              region: '',
              postalCode: 'B15 8JX',
              country: 'GB'
            }
          },
        }
      ];

      it('should import order records', () => {
        const r = new RecordSet(t);
        r.addSQLResult(lines);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
            '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"",' +
            '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}}},{"company":"ABE081","order_id":13,' +
            '"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial","address":{"company":"","street":"14 Whitfield Road","locality":"",' +
            '"city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
            '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}}}]'
        );
      });

      it('should import order data', () => {
        const r = new RecordSet(t);
        r.addRecord(data);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
            '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"",' +
            '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}}},{"company":"ABE081","order_id":13,' +
            '"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial","address":{"company":"","street":"14 Whitfield Road","locality":"",' +
            '"city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
            '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}}}]'
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

      it('should collate order lines with collater', () => {
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
            company: 'ABE081',
            order_id: 14,
            order_date: '2020-04-13',
            customer: 'THT001',
            delivery_name: 'Terry Test',
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
            lines_company: 'ABE081',
            lines_order_id: 14,
            lines_line_no: 1,
            lines_sku: 'RQ415',
            lines_description: 'Strimmer',
            lines_qty: 1,
            lines_price: 94.12
          }
        ];

        const r = new RecordSet(j, { collate: [ 'company', { delivery: 'name' }, { lines: 'sku' } ] });
        r.addSQLResult(lines);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"",' +
          '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test",' +
          '"address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
          '"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,' +
          '"line_no":2,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94},{"company":"ABE081","order_id":14,"line_no":1,"sku":"RQ415","description":"Strimmer",' +
          '"qty":1,"price":94.12}]},{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial",' +
          '"address":{"company":"","street":"14 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
          '"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"",' +
          '"postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]}]'
        );
      });

      it('should collate order lines with collater', () => {
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
            company: 'ABE081',
            order_id: 14,
            order_date: '2020-04-13',
            customer: 'THT001',
            delivery_name: 'Terry Test',
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
            lines_company: 'ABE081',
            lines_order_id: 14,
            lines_line_no: 1,
            lines_sku: 'RQ415',
            lines_description: 'Strimmer',
            lines_qty: 1,
            lines_price: 94.12
          }
        ];

        const r = j.collate(lines, { collate: [ 'company', { delivery: 'name' }, { lines: 'sku' } ] });
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"",' +
          '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test",' +
          '"address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
          '"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,' +
          '"line_no":2,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94},{"company":"ABE081","order_id":14,"line_no":1,"sku":"RQ415","description":"Strimmer",' +
          '"qty":1,"price":94.12}]},{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial",' +
          '"address":{"company":"","street":"14 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
          '"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"",' +
          '"postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]}]'
        );
      });

      it('should import order records', () => {

        const data = [
          {
            company: 'ABE081',
            order_id: 12,
            order_date: '2020-04-13',
            customer: 'TET001',
            delivery: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: {
              company: 'ABE081',
              order_id: 12,
              line_no: 1,
              sku: 'ABA001',
              description: 'Widget',
              qty: 1,
              price: 4.32
            }
          },
          {
            company: 'ABE081',
            order_id: 12,
            order_date: '2020-04-13',
            customer: 'TET001',
            delivery: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: {
              company: 'ABE081',
              order_id: 12,
              line_no: 2,
              sku: 'ABJ994',
              description: 'Gadget',
              qty: 100,
              price: 8.94
            }
          },
          {
            company: 'ABE081',
            order_id: 13,
            order_date: '2020-04-13',
            customer: 'TAT001',
            delivery: {
              name: 'Tabitha Trial',
              address: {
                company: '',
                street: '14 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: {
              company: 'ABE081',
              order_id: 13,
              line_no: 1,
              sku: 'ABJ994',
              description: 'Gadget',
              qty: 100,
              price: 8.94
            }
          },
          {
            company: 'ANE131',
            order_id: 14,
            order_date: '2020-04-13',
            customer: 'THT001',
            delivery: {
              name: 'Thomas Test',
              address: {
                company: '',
                street: '18 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Thomas Test',
              address: {
                company: '',
                street: '18 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: {
              company: 'ANE131',
              order_id: 14,
              line_no: 1,
              sku: 'GTE941',
              description: 'Soldering iron',
              qty: 5,
              price: 12.14
            }
          }
        ];

        const r = new RecordSet(j);
        r.addRecord(data);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"",' +
            '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":12,' +
            '"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,"line_no":2,"sku":"ABJ994","description":"Gadget",' +
            '"qty":100,"price":8.94}]},{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial",' +
            '"address":{"company":"","street":"14 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
            '"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX",' +
            '"country":"GB"}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]},' +
            '{"company":"ANE131","order_id":14,"order_date":"2020-04-13","customer":"THT001","delivery":{"name":"Thomas Test","address":{"company":"",' +
            '"street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Thomas Test",' +
            '"address":{"company":"","street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
            '"lines":[{"company":"ANE131","order_id":14,"line_no":1,"sku":"GTE941","description":"Soldering iron","qty":5,"price":12.14}]}]'
        );

      });

      it('should import order records', () => {

        const data = [
          {
            company: 'ABE081',
            order_id: 12,
            order_date: '2020-04-13',
            customer: 'TET001',
            delivery: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: [
              {
                company: 'ABE081',
                order_id: 12,
                line_no: 1,
                sku: 'ABA001',
                description: 'Widget',
                qty: 1,
                price: 4.32
              },
              {
                company: 'ABE081',
                order_id: 12,
                line_no: 2,
                sku: 'ABJ994',
                description: 'Gadget',
                qty: 100,
                price: 8.94
              }
            ]
          },
          {
            company: 'ABE081',
            order_id: 13,
            order_date: '2020-04-13',
            customer: 'TAT001',
            delivery: {
              name: 'Tabitha Trial',
              address: {
                company: '',
                street: '14 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: [
              {
                company: 'ABE081',
                order_id: 13,
                line_no: 1,
                sku: 'ABJ994',
                description: 'Gadget',
                qty: 100,
                price: 8.94
              }
            ]
          },
          {
            company: 'ANE131',
            order_id: 14,
            order_date: '2020-04-13',
            customer: 'THT001',
            delivery: {
              name: 'Thomas Test',
              address: {
                company: '',
                street: '18 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Thomas Test',
              address: {
                company: '',
                street: '18 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: {
              company: 'ANE131',
              order_id: 14,
              line_no: 1,
              sku: 'GTE941',
              description: 'Soldering iron',
              qty: 5,
              price: 12.14
            }
          }
        ];

        const r = new RecordSet(j);
        r.addRecord(data);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test","address":{"company":"",' +
            '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"lines":[{"company":"ABE081","order_id":12,' +
            '"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,"line_no":2,"sku":"ABJ994","description":"Gadget",' +
            '"qty":100,"price":8.94}]},{"company":"ABE081","order_id":13,"order_date":"2020-04-13","customer":"TAT001","delivery":{"name":"Tabitha Trial",' +
            '"address":{"company":"","street":"14 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
            '"invoice":{"name":"Terry Test","address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX",' +
            '"country":"GB"}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]},' +
            '{"company":"ANE131","order_id":14,"order_date":"2020-04-13","customer":"THT001","delivery":{"name":"Thomas Test","address":{"company":"",' +
            '"street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Thomas Test",' +
            '"address":{"company":"","street":"18 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
            '"lines":[{"company":"ANE131","order_id":14,"line_no":1,"sku":"GTE941","description":"Soldering iron","qty":5,"price":12.14}]}]'
        );
      });

      it('should import order record', () => {

        const data = [
          {
            company: 'ABE081',
            order_id: 12,
            order_date: '2020-04-13',
            customer: 'TET001',
            delivery: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Test',
              address: {
                company: '',
                street: '12 Whitfield Road',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B15 8JX',
                country: 'GB'
              }
            },
            lines: [
              {
                company: 'ABE081',
                order_id: 12,
                line_no: 1,
                sku: 'ABA001',
                description: 'Widget',
                qty: 1,
                price: 4.32
              },
              {
                company: 'ABE081',
                order_id: 12,
                line_no: 2,
                sku: 'ABJ994',
                description: 'Gadget',
                qty: 100,
                price: 8.94
              }
            ]
          }
        ];

        const r = new RecordSet(j);
        r.addRecord(data);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ABE081","order_id":12,"order_date":"2020-04-13","customer":"TET001","delivery":{"name":"Terry Test","address":{"company":"",' +
            '"street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},"invoice":{"name":"Terry Test",' +
            '"address":{"company":"","street":"12 Whitfield Road","locality":"","city":"Birmingham","region":"","postalCode":"B15 8JX","country":"GB"}},' +
            '"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32},{"company":"ABE081","order_id":12,' +
            '"line_no":2,"sku":"ABJ994","description":"Gadget","qty":100,"price":8.94}]}]'
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
          '[{"company":null,"order_id":null,"order_date":null,"customer":null,"delivery":{"name":null,"address":{"company":null,"street":null,"locality":null,"city":null,' +
            '"region":null,"postalCode":null,"country":null}},"invoice":{"name":null,"address":{"company":null,"street":null,"locality":null,"city":null,"region":null,' +
            '"postalCode":null,"country":null}},"lines":[{"company":"ABE081","order_id":12,"line_no":1,"sku":"ABA001","description":"Widget","qty":1,"price":4.32}]},' +
            '{"company":null,"order_id":null,"order_date":null,"customer":null,"delivery":{"name":null,"address":{"company":null,"street":null,"locality":null,' +
            '"city":null,"region":null,"postalCode":null,"country":null}},"invoice":{"name":null,"address":{"company":null,"street":null,"locality":null,"city":null,' +
            '"region":null,"postalCode":null,"country":null}},"lines":[{"company":"ABE081","order_id":12,"line_no":2,"sku":"ABJ994","description":"Gadget","qty":100,' +
            '"price":8.94}]},{"company":null,"order_id":null,"order_date":null,"customer":null,"delivery":{"name":null,"address":{"company":null,"street":null,' +
            '"locality":null,"city":null,"region":null,"postalCode":null,"country":null}},"invoice":{"name":null,"address":{"company":null,"street":null,' +
            '"locality":null,"city":null,"region":null,"postalCode":null,"country":null}},"lines":[{"company":"ABE081","order_id":13,"line_no":1,"sku":"ABJ994",' +
            '"description":"Gadget","qty":100,"price":8.94}]}]'
        );
      });

    });

    describe('inventory tests', () => {

      const j = joins.inventory;

      it('should collate inventory lines', () => {
        const r = new RecordSet(j);
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

      it('should import inventory records', () => {
        const r = new RecordSet(j);
        const data = [
          {
            company: 'HJ8009',
            sku: 'JFX192',
            description: 'gadget',
            warehouse: {
              company: 'HJ9009',
              name: 'mercury',
              description: '',
              address: {
                company: 'H&J Ltd',
                street: '16 Hatfield court',
                locality: 'Chester Industrial Estate',
                city: 'Manchester',
                region: '',
                postalCode: 'M8 9EF',
                country: 'GB'
              }
            },
            bin: {
              company: 'HJ8009',
              warehouse_name: 'mercury',
              bin: 'A15D2'
            },
            inventory: {
              company: 'HJ8009',
              sku: 'JFX192',
              warehouse: 'mercury',
              bin: 'A15D2',
              time: '2020-04-13 12:45:31',
              qty: 7,
              cost: 6.32
            }
          },
          {
            company: 'HJ8009',
            sku: 'JFX192',
            description: 'gadget',
            warehouse: {
              company: 'HJ9009',
              name: 'mercury',
              description: '',
              address: {
                company: 'H&J Ltd',
                street: '16 Hatfield court',
                locality: 'Chester Industrial Estate',
                city: 'Manchester',
                region: '',
                postalCode: 'M8 9EF',
                country: 'GB'
              }
            },
            bin: {
              company: 'HJ8009',
              warehouse_name: 'mercury',
              bin: 'A15D2'
            },
            inventory: {
              company: 'HJ8009',
              sku: 'JFX192',
              warehouse: 'mercury',
              bin: 'A15D2',
              time: '2019-10-20 15:09:12',
              qty: 800,
              cost: 6.32
            }
          },
          {
            company: 'HJ8009',
            sku: 'JFX192',
            description: 'gadget',
            warehouse: {
              company: 'HJ9009',
              name: 'mercury',
              description: '',
              address: {
                company: 'H&J Ltd',
                street: '16 Hatfield court',
                locality: 'Chester Industrial Estate',
                city: 'Manchester',
                region: '',
                postalCode: 'M8 9EF',
                country: 'GB'
              }
            },
            bin: {
              company: 'HJ8009',
              warehouse_name: 'mercury',
              bin: 'A15D2'
            },
            inventory: {
              company: 'HJ8009',
              sku: 'JFX192',
              warehouse: 'mercury',
              bin: 'A15D2',
              time: '2019-03-09 08:15:42',
              qty: 7,
              cost: 6.32
            }
          },
          {
            company: 'HJ8009',
            sku: 'JFX192',
            description: 'gadget',
            warehouse: {
              company: 'HJ9009',
              name: 'mercury',
              description: '',
              address: {
                company: 'H&J Ltd',
                street: '16 Hatfield court',
                locality: 'Chester Industrial Estate',
                city: 'Manchester',
                region: '',
                postalCode: 'M8 9EF',
                country: 'GB'
              }
            },
            bin: {
              company: 'HJ8009',
              warehouse_name: 'mercury',
              bin: 'B09A6'
            },
            inventory: {
              company: 'HJ8009',
              sku: 'JFX192',
              warehouse: 'mercury',
              bin: 'B09A6',
              time: '2017-06-14 11:21:09',
              qty: 600,
              cost: 5.14
            }
          }
        ];
        r.addRecord(data);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"HJ8009","sku":"JFX192","description":"gadget","warehouse":[{"company":"HJ9009","name":"mercury","description":"","address":{"company":"H&J Ltd",' +
          '"street":"16 Hatfield court","locality":"Chester Industrial Estate","city":"Manchester","region":"","postalCode":"M8 9EF","country":"GB"}}],' +
          '"bin":[{"company":"HJ8009","warehouse_name":"mercury","bin":"A15D2"},{"company":"HJ8009","warehouse_name":"mercury","bin":"B09A6"}],' +
          '"inventory":[{"company":"HJ8009","sku":"JFX192","bin":"A15D2","time":"2020-04-13 12:45:31","qty":7,"cost":6.32},{"company":"HJ8009","sku":"JFX192","bin":"A15D2",' +
          '"time":"2019-10-20 15:09:12","qty":800,"cost":6.32},{"company":"HJ8009","sku":"JFX192","bin":"A15D2","time":"2019-03-09 08:15:42","qty":7,"cost":6.32},' +
          '{"company":"HJ8009","sku":"JFX192","bin":"B09A6","time":"2017-06-14 11:21:09","qty":600,"cost":5.14}]}]'
        );
      });

      it('should collate inventory lines with null fields', () => {
        const r = new RecordSet(j);
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
            bin_company: null,
            bin_warehouse_name: null,
            bin_bin: null,
            inventory_company: null,
            inventory_sku: null,
            inventory_warehouse: null,
            inventory_bin: null,
            inventory_time: null,
            inventory_qty: null,
            inventory_cost: null
          }
        ];
        r.addSQLResult(lines);
        expect(JSON.stringify(r)).toBe(
          '[{"company":"HJ8009","sku":"JFX192","description":"gadget","warehouse":[{"company":"HJ9009","name":"mercury","description":"","address":{"company":"H&J Ltd",' +
          '"street":"16 Hatfield court","locality":"Chester Industrial Estate","city":"Manchester","region":"","postalCode":"M8 9EF","country":"GB"}}],"bin":[],"inventory":[]}]'
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

      const data = [
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse: {
            company: 'ANA191',
            name: 'Chesterfield',
            description: 'grotty',
            address: {
              company: 'Tools 4 U Ltd',
              street: '29 Sudbury Lane',
              locality: '',
              city: 'Chesterfield',
              region: 'Derbyshire',
              postalCode: 'S40 9DS',
              country: 'GB'
            },
            bins: {
              company: 'ANA191',
              warehouse_name: 'Chesterfield',
              bin: 'FA76D2',
              inventory: {
                sku: 'DX676',
                bin: 'FA76D2',
                time: '2019-06-14 09:12:54',
                qty: 5,
                cost: 98.34
              }
            }
          }
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse: {
            company: 'ANA191',
            name: 'Chesterfield',
            description: 'grotty',
            address: {
              company: 'Tools 4 U Ltd',
              street: '29 Sudbury Lane',
              locality: '',
              city: 'Chesterfield',
              region: 'Derbyshire',
              postalCode: 'S40 9DS',
              country: 'GB'
            },
            bins: {
              warehouse_name: 'Chesterfield',
              company: 'ANA191',
              warehouse_name: 'Chesterfield',
              bin: 'GA15A3',
              inventory: {
                sku: 'DX676',
                bin: 'GA15A3',
                time: '2019-04-30 11:32:19',
                qty: 20,
                cost: 96.41
              }
            }
          }
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse: {
            company: 'ANA191',
            name: 'Chesterfield',
            description: 'grotty',
            address: {
              company: 'Tools 4 U Ltd',
              street: '29 Sudbury Lane',
              locality: '',
              city: 'Chesterfield',
              region: 'Derbyshire',
              postalCode: 'S40 9DS',
              country: 'GB'
            },
            bins: {
              company: 'ANA191',
              warehouse_name: 'Chesterfield',
              bin: 'FA76D2',
              inventory: {
                sku: 'DX676',
                bin: 'FA76D2',
                time: '2019-07-16 13:16:29',
                qty: 40,
                cost: 95.32
              }
            }
          }
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse: {
            company: 'ANA191',
            name: 'Chesterfield',
            description: 'grotty',
            address: {
              company: 'Tools 4 U Ltd',
              street: '29 Sudbury Lane',
              locality: '',
              city: 'Chesterfield',
              region: 'Derbyshire',
              postalCode: 'S40 9DS',
              country: 'GB'
            },
            bins: {
              company: 'ANA191',
              warehouse_name: 'Chesterfield',
              bin: 'FA76D2',
              inventory: {
                sku: 'DX676',
                bin: 'FA76D2',
                time: '2019-06-14 09:12:54',
                qty: 5,
                cost: 98.34
              }
            }
          }
        },
        {
          company: 'ANA191',
          sku: 'DX676',
          description: 'Hammer',
          warehouse: {
            company: 'ANA191',
            name: 'Wolverhampton',
            description: 'even grottier',
            address: {
              company: 'Hammer Time Ltd',
              street: '45 Strawberry St',
              locality: '',
              city: 'Wolverhampton',
              region: 'West Midlands',
              postalCode: 'WV17 9JK',
              country: 'GB'
            },
            bins: {
              company: 'ANA191',
              warehouse_name: 'Wolverhampton',
              bin: 'J16X',
              inventory: {
                sku: 'DX676',
                bin: 'J16X',
                time: '2020-02-12 08:55:19',
                qty: 200,
                cost: 84.96
              }
            }
          }
        },
        {
          company: 'ANA191',
          sku: 'DX678',
          description: 'Chisel',
          warehouse: {
            company: 'ANA191',
            name: 'Telford',
            description: 'quite nice but small',
            address: {
              company: 'Chisels Unlimited Ltd',
              street: '16 Shrewsbury St',
              locality: 'Victoria Business Park',
              city: 'Telford',
              region: 'Shropshire',
              postalCode: 'TF2 8XD',
              country: 'GB'
            },
            bins: {
              company: 'ANA191',
              warehouse_name: 'Telford',
              bin: 'H78D',
              inventory: []
            }
          }
        }
      ];

      it("should collate lines for inventory2", () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r.get('[0].warehouse[0].bins[0]'))).toBe(
          '{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2",' +
            '"time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2","time":"2019-07-16 13:16:29",' +
            '"qty":40,"cost":95.32}]}'
        );
        expect(JSON.stringify(r)).toBe(
          '[{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[{"company":"ANA191","name":"Chesterfield","description":"grotty",' +
            '"address":{"company":"Tools 4 U Ltd","street":"29 Sudbury Lane","locality":"","city":"Chesterfield","region":"Derbyshire","postalCode":"S40 9DS","country":"GB"},' +
            '"bins":[{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield",' +
            '"bin":"FA76D2","time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2",' +
            '"time":"2019-07-16 13:16:29","qty":40,"cost":95.32}]},{"company":"ANA191","warehouse_name":"Chesterfield","bin":"GA15A3","inventory":[{"company":"ANA191",' +
            '"sku":"DX676","warehouse_name":"Chesterfield","bin":"GA15A3","time":"2019-04-30 11:32:19","qty":20,"cost":96.41}]}]},{"company":"ANA191","name":"Wolverhampton",' +
            '"description":"even grottier","address":{"company":"Hammer Time Ltd","street":"45 Strawberry St","locality":"","city":"Wolverhampton","region":"West Midlands",' +
            '"postalCode":"WV17 9JK","country":"GB"},"bins":[{"company":"ANA191","warehouse_name":"Wolverhampton","bin":"J16X","inventory":[{"company":"ANA191","sku":"DX676",' +
            '"warehouse_name":"Wolverhampton","bin":"J16X","time":"2020-02-12 08:55:19","qty":200,"cost":84.96}]}]}]},{"company":"ANA191","sku":"DX678","description":"Chisel",' +
            '"warehouse":[{"company":"ANA191","name":"Telford","description":"quite nice but small","address":{"company":"Chisels Unlimited Ltd","street":"16 Shrewsbury St",' +
            '"locality":"Victoria Business Park","city":"Telford","region":"Shropshire","postalCode":"TF2 8XD","country":"GB"},"bins":[{"company":"ANA191",' +
            '"warehouse_name":"Telford","bin":"H78D","inventory":[]}]}]}]'
        );
        expect(JSON.stringify(j.validate(r).validationResult())).toBe(
          '{"results":[{"record":{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[{"company":"ANA191","name":"Chesterfield","description":"grotty",' +
            '"address":{"company":"Tools 4 U Ltd","street":"29 Sudbury Lane","locality":"","city":"Chesterfield","region":"Derbyshire","postalCode":"S40 9DS","country":"GB"},' +
            '"bins":[{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield",' +
            '"bin":"FA76D2","time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"ANA191","sku":"DX676","warehouse_name":"Chesterfield","bin":"FA76D2",' +
            '"time":"2019-07-16 13:16:29","qty":40,"cost":95.32}]},{"company":"ANA191","warehouse_name":"Chesterfield","bin":"GA15A3","inventory":[{"company":"ANA191",' +
            '"sku":"DX676","warehouse_name":"Chesterfield","bin":"GA15A3","time":"2019-04-30 11:32:19","qty":20,"cost":96.41}]}]},{"company":"ANA191","name":"Wolverhampton",' +
            '"description":"even grottier","address":{"company":"Hammer Time Ltd","street":"45 Strawberry St","locality":"","city":"Wolverhampton","region":"West Midlands",' +
            '"postalCode":"WV17 9JK","country":"GB"},"bins":[{"company":"ANA191","warehouse_name":"Wolverhampton","bin":"J16X","inventory":[{"company":"ANA191","sku":"DX676",' +
            '"warehouse_name":"Wolverhampton","bin":"J16X","time":"2020-02-12 08:55:19","qty":200,"cost":84.96}]}]}]},"valid":true,"errors":{}},{"record":{"company":"ANA191",' +
            '"sku":"DX678","description":"Chisel","warehouse":[{"company":"ANA191","name":"Telford","description":"quite nice but small",' +
            '"address":{"company":"Chisels Unlimited Ltd","street":"16 Shrewsbury St","locality":"Victoria Business Park","city":"Telford","region":"Shropshire",' +
            '"postalCode":"TF2 8XD","country":"GB"},"bins":[{"company":"ANA191","warehouse_name":"Telford","bin":"H78D","inventory":[]}]}]},"valid":true,"errors":{}}],"valid":true}'
        );
      });

      it("should import records for inventory2", () => {
        const r = new RecordSet(j);
        r.addRecord(data);
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
        expect(JSON.stringify(j.validate(r).validationResult())).toBe(
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

      it('should import one line for inventory2', () => {
        const line = {
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
        };
        expect(JSON.stringify(j.collate(line))).toBe(
          '[{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[{"company":"ANA191","name":"Chesterfield","description":"grotty",' +
            '"address":{"company":"Tools 4 U Ltd","street":"29 Sudbury Lane","locality":"","city":"Chesterfield","region":"Derbyshire","postalCode":"S40 9DS",' +
            '"country":"GB"},"bins":[{"company":"ANA191","warehouse_name":"Chesterfield","bin":"FA76D2","inventory":[{"company":"ANA191","sku":"DX676",' +
            '"warehouse_name":"Chesterfield","bin":"FA76D2","time":"2019-06-14 09:12:54","qty":5,"cost":98.34}]}]}]}]'
        );
      });

      it('should collate lines with null fields', () => {
        const lines = [
          {
            company: 'ANA191',
            sku: 'DX676',
            description: 'Hammer',
            warehouse_company: null,
            warehouse_name: null,
            warehouse_description: null,
            warehouse_address_company: null,
            warehouse_address_street: null,
            warehouse_address_locality: null,
            warehouse_address_city: null,
            warehouse_address_region: null,
            warehouse_address_postalCode: null,
            warehouse_address_country: null,
            warehouse_bins_company: null,
            warehouse_bins_warehouse_name: null,
            warehouse_bins_bin: null,
            warehouse_bins_inventory_sku: null,
            warehouse_bins_inventory_bin: null,
            warehouse_bins_inventory_time: null,
            warehouse_bins_inventory_qty: null,
            warehouse_bins_inventory_cost: null
          }
        ];
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r)).toBe('[{"company":"ANA191","sku":"DX676","description":"Hammer","warehouse":[]}]');
      });

      it('should create update statements', () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r.UpdateKey({ company: 'ACE002' }))).toBe(
          '["update \\"stock\\" set \\"stock\\".\\"company\\" = \'ANA191\', \\"stock\\".\\"sku\\" = \'DX676\', \\"stock\\".\\"description\\" = \'Hammer\' ' +
            'where \\"stock\\".\\"company\\" = \'ACE002\' and \\"stock\\".\\"sku\\" = \'DX676\'","update \\"s1\\".\\"warehouse\\" as \\"w1\\" ' +
            'set \\"w1\\".\\"company\\" = \'ANA191\', \\"w1\\".\\"name\\" = \'Chesterfield\', \\"w1\\".\\"description\\" = \'grotty\', ' +
            '\\"w1\\".\\"address_company\\" = \'Tools 4 U Ltd\', \\"w1\\".\\"address_street\\" = \'29 Sudbury Lane\', \\"w1\\".\\"address_locality\\" = \'\', ' +
            '\\"w1\\".\\"address_city\\" = \'Chesterfield\', \\"w1\\".\\"address_region\\" = \'Derbyshire\', \\"w1\\".\\"address_postalCode\\" = \'S40 9DS\', ' +
            '\\"w1\\".\\"address_country\\" = \'GB\' where \\"w1\\".\\"company\\" = \'ACE002\' and \\"w1\\".\\"name\\" = \'Chesterfield\'","update \\"warehouse_bins\\" ' +
            'set \\"warehouse_bins\\".\\"company\\" = \'ANA191\', \\"warehouse_bins\\".\\"warehouse_name\\" = \'Chesterfield\', \\"warehouse_bins\\".\\"bin\\" = \'FA76D2\' ' +
            'where \\"warehouse_bins\\".\\"company\\" = \'ACE002\' and \\"warehouse_bins\\".\\"warehouse_name\\" = \'Chesterfield\' and ' +
            '\\"warehouse_bins\\".\\"bin\\" = \'FA76D2\'","update \\"inventory\\" set \\"inventory\\".\\"company\\" = \'ANA191\', \\"inventory\\".\\"sku\\" = \'DX676\', ' +
            '\\"inventory\\".\\"warehouse_name\\" = \'Chesterfield\', \\"inventory\\".\\"bin\\" = \'FA76D2\', \\"inventory\\".\\"time\\" = \'2019-06-14 09:12:54\', ' +
            '\\"inventory\\".\\"qty\\" = 5, \\"inventory\\".\\"cost\\" = 98.34 where \\"inventory\\".\\"company\\" = \'ACE002\' and \\"inventory\\".\\"sku\\" = \'DX676\' ' +
            'and \\"inventory\\".\\"warehouse_name\\" = \'Chesterfield\' and \\"inventory\\".\\"bin\\" = \'FA76D2\' and \\"inventory\\".\\"time\\" = \'2019-06-14 09:12:54\'",' +
            '"update \\"inventory\\" set \\"inventory\\".\\"company\\" = \'ANA191\', \\"inventory\\".\\"sku\\" = \'DX676\', \\"inventory\\".\\"warehouse_name\\" = \'Chesterfield\', ' +
            '\\"inventory\\".\\"bin\\" = \'FA76D2\', \\"inventory\\".\\"time\\" = \'2019-07-16 13:16:29\', \\"inventory\\".\\"qty\\" = 40, \\"inventory\\".\\"cost\\" = 95.32 ' +
            'where \\"inventory\\".\\"company\\" = \'ACE002\' and \\"inventory\\".\\"sku\\" = \'DX676\' and \\"inventory\\".\\"warehouse_name\\" = \'Chesterfield\' and ' +
            '\\"inventory\\".\\"bin\\" = \'FA76D2\' and \\"inventory\\".\\"time\\" = \'2019-07-16 13:16:29\'","update \\"warehouse_bins\\" set ' +
            '\\"warehouse_bins\\".\\"company\\" = \'ANA191\', \\"warehouse_bins\\".\\"warehouse_name\\" = \'Chesterfield\', \\"warehouse_bins\\".\\"bin\\" = \'GA15A3\' ' +
            'where \\"warehouse_bins\\".\\"company\\" = \'ACE002\' and \\"warehouse_bins\\".\\"warehouse_name\\" = \'Chesterfield\' and \\"warehouse_bins\\".\\"bin\\" = \'GA15A3\'",' +
            '"update \\"inventory\\" set \\"inventory\\".\\"company\\" = \'ANA191\', \\"inventory\\".\\"sku\\" = \'DX676\', \\"inventory\\".\\"warehouse_name\\" = \'Chesterfield\', ' +
            '\\"inventory\\".\\"bin\\" = \'GA15A3\', \\"inventory\\".\\"time\\" = \'2019-04-30 11:32:19\', \\"inventory\\".\\"qty\\" = 20, \\"inventory\\".\\"cost\\" = 96.41 ' +
            'where \\"inventory\\".\\"company\\" = \'ACE002\' and \\"inventory\\".\\"sku\\" = \'DX676\' and \\"inventory\\".\\"warehouse_name\\" = \'Chesterfield\' and ' +
            '\\"inventory\\".\\"bin\\" = \'GA15A3\' and \\"inventory\\".\\"time\\" = \'2019-04-30 11:32:19\'","update \\"s1\\".\\"warehouse\\" as \\"w1\\" ' +
            'set \\"w1\\".\\"company\\" = \'ANA191\', \\"w1\\".\\"name\\" = \'Wolverhampton\', \\"w1\\".\\"description\\" = \'even grottier\', ' +
            '\\"w1\\".\\"address_company\\" = \'Hammer Time Ltd\', \\"w1\\".\\"address_street\\" = \'45 Strawberry St\', \\"w1\\".\\"address_locality\\" = \'\', ' +
            '\\"w1\\".\\"address_city\\" = \'Wolverhampton\', \\"w1\\".\\"address_region\\" = \'West Midlands\', \\"w1\\".\\"address_postalCode\\" = \'WV17 9JK\', ' +
            '\\"w1\\".\\"address_country\\" = \'GB\' where \\"w1\\".\\"company\\" = \'ACE002\' and \\"w1\\".\\"name\\" = \'Wolverhampton\'","update \\"warehouse_bins\\" ' +
            'set \\"warehouse_bins\\".\\"company\\" = \'ANA191\', \\"warehouse_bins\\".\\"warehouse_name\\" = \'Wolverhampton\', \\"warehouse_bins\\".\\"bin\\" = \'J16X\' ' +
            'where \\"warehouse_bins\\".\\"company\\" = \'ACE002\' and \\"warehouse_bins\\".\\"warehouse_name\\" = \'Wolverhampton\' and \\"warehouse_bins\\".\\"bin\\" = \'J16X\'",' +
            '"update \\"inventory\\" set \\"inventory\\".\\"company\\" = \'ANA191\', \\"inventory\\".\\"sku\\" = \'DX676\', \\"inventory\\".\\"warehouse_name\\" = \'Wolverhampton\', ' +
            '\\"inventory\\".\\"bin\\" = \'J16X\', \\"inventory\\".\\"time\\" = \'2020-02-12 08:55:19\', \\"inventory\\".\\"qty\\" = 200, \\"inventory\\".\\"cost\\" = 84.96 ' +
            'where \\"inventory\\".\\"company\\" = \'ACE002\' and \\"inventory\\".\\"sku\\" = \'DX676\' and \\"inventory\\".\\"warehouse_name\\" = \'Wolverhampton\' and ' +
            '\\"inventory\\".\\"bin\\" = \'J16X\' and \\"inventory\\".\\"time\\" = \'2020-02-12 08:55:19\'","update \\"stock\\" set \\"stock\\".\\"company\\" = \'ANA191\', ' +
            '\\"stock\\".\\"sku\\" = \'DX678\', \\"stock\\".\\"description\\" = \'Chisel\' where \\"stock\\".\\"company\\" = \'ACE002\' and \\"stock\\".\\"sku\\" = \'DX678\'",' +
            '"update \\"s1\\".\\"warehouse\\" as \\"w1\\" set \\"w1\\".\\"company\\" = \'ANA191\', \\"w1\\".\\"name\\" = \'Telford\', \\"w1\\".\\"description\\" = ' +
            '\'quite nice but small\', \\"w1\\".\\"address_company\\" = \'Chisels Unlimited Ltd\', \\"w1\\".\\"address_street\\" = \'16 Shrewsbury St\', ' +
            '\\"w1\\".\\"address_locality\\" = \'Victoria Business Park\', \\"w1\\".\\"address_city\\" = \'Telford\', \\"w1\\".\\"address_region\\" = \'Shropshire\', ' +
            '\\"w1\\".\\"address_postalCode\\" = \'TF2 8XD\', \\"w1\\".\\"address_country\\" = \'GB\' where \\"w1\\".\\"company\\" = \'ACE002\' and ' +
            '\\"w1\\".\\"name\\" = \'Telford\'","update \\"warehouse_bins\\" set \\"warehouse_bins\\".\\"company\\" = \'ANA191\', \\"warehouse_bins\\".\\"warehouse_name\\" = ' +
            '\'Telford\', \\"warehouse_bins\\".\\"bin\\" = \'H78D\' where \\"warehouse_bins\\".\\"company\\" = \'ACE002\' and ' +
            '\\"warehouse_bins\\".\\"warehouse_name\\" = \'Telford\' and \\"warehouse_bins\\".\\"bin\\" = \'H78D\'"]'
        );
      });

      it('should create update statements', () => {
        const r = new RecordSet(j);
        r.addSQLResult(lines);
        expect(JSON.stringify(r.UpdateWhere({ company: 'ACE002' }, { safe: false }))).toBe(
          '["update \\"stock\\" set \\"stock\\".\\"company\\" = \'ANA191\', \\"stock\\".\\"sku\\" = \'DX676\', \\"stock\\".\\"description\\" = \'Hammer\' ' +
            'where \\"stock\\".\\"company\\" = \'ACE002\'","update \\"stock\\" set \\"stock\\".\\"company\\" = \'ANA191\', \\"stock\\".\\"sku\\" = \'DX678\', ' +
            '\\"stock\\".\\"description\\" = \'Chisel\' where \\"stock\\".\\"company\\" = \'ACE002\'"]'
        );
      });

      it('should update first 5 records', () => {
        const r = j.toRecordSet({
          company: 'ANA191',
          description: ''
        });
        expect(r.Update({ orderBy: 'sku', limit: 5, safe: false })).toEqual(
          ['update "stock" set "stock"."description" = \'\' where "stock"."company" = \'ANA191\' order by "stock"."sku" asc limit 5']
        );
      });

      it('should update records 10-15', () => {
        const r = j.toRecordSet({
          company: 'ANA191',
          description: ''
        });
        expect(r.Update({ orderBy: 'sku', limit: 5, start: 10, safe: false })).toEqual(
          ['update "stock" set "stock"."description" = \'\' where "stock"."company" = \'ANA191\' order by "stock"."sku" asc limit 10, 5']
        );
      });

      it('should update first 5 records', () => {
        const r = j.toRecordSet({
          company: 'ANA191'
        });
        expect(r.UpdateWhere({ company: 'ANA85' }, { orderBy: 'sku', limit: 5, safe: false })).toEqual([
          `update "stock" set "stock"."company" = 'ANA191' where "stock"."company" = 'ANA85' order by "stock"."sku" asc limit 5`
        ]);
      });

      it('should update first 5 records', () => {
        const r = j.toRecordSet({
          company: 'ANA191'
        });
        expect(r.UpdateKey({ company: 'ANA85' }, { orderBy: 'sku', limit: 5, safe: false })).toEqual([
          `update "stock" set "stock"."company" = 'ANA191' where "stock"."company" = 'ANA85' order by "stock"."sku" asc limit 5`
        ]);
      });

      it('should delete first 5 records', () => {
        const r = j.toRecordSet({
          company: 'ANA191',
        });
        expect(r.Delete({ orderBy: 'sku', limit: 5, safe: false })).toEqual([
          `delete "stock" from "stock" where "stock"."company" = 'ANA191' order by "stock"."sku" asc limit 5`
        ]);
      });

      it('should delete records 10-15', () => {
        const r = j.toRecordSet({
          company: 'ANA191',
          description: ''
        });
        expect(r.Delete({ orderBy: 'sku', limit: 5, start: 10, safe: false })).toEqual([
          `delete "stock" from "stock" where "stock"."company" = 'ANA191' order by "stock"."sku" asc limit 10, 5`
        ]);
      });

      it('should delete records 10-15', () => {
        const r = j.toRecordSet({
          company: 'ANA191',
          description: ''
        });
        expect(r.DeleteWhere({ orderBy: 'sku', limit: 5, start: 10, safe: false })).toEqual([
          `delete "stock" from "stock" where "stock"."company" = 'ANA191' and "stock"."description" = '' order by "stock"."sku" asc limit 10, 5`
        ]);
      });

      it('should create insert statements', () => {
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.Insert())).toBe(
          '["insert into \\\"stock\\\" (\\\"company\\\", \\\"sku\\\", \\\"description\\\") values (\'ANA191\', \'DX676\', \'Hammer\'), (\'ANA191\', \'DX678\', \'Chisel\')",' +
            '"insert into \\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", ' +
            '\\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Chesterfield\', \'grotty\', \'Tools 4 U Ltd\', \'29 Sudbury Lane\', ' +
            '\'\', \'Chesterfield\', \'Derbyshire\', \'S40 9DS\', \'GB\'), (\'ANA191\', \'Wolverhampton\', \'even grottier\', \'Hammer Time Ltd\', \'45 Strawberry St\', ' +
            '\'\', \'Wolverhampton\', \'West Midlands\', \'WV17 9JK\', \'GB\')","insert into \\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values ' +
            '(\'ANA191\', \'Chesterfield\', \'FA76D2\'), (\'ANA191\', \'Chesterfield\', \'GA15A3\')","insert into \\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", ' +
            '\\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-06-14 09:12:54\', 5, 98.34), ' +
            '(\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-07-16 13:16:29\', 40, 95.32)","insert into \\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", ' +
            '\\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'GA15A3\', \'2019-04-30 11:32:19\', 20, 96.41)",' +
            '"insert into \\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Wolverhampton\', \'J16X\')","insert into \\\"inventory\\\" ' +
            '(\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Wolverhampton\', \'J16X\', ' +
            '\'2020-02-12 08:55:19\', 200, 84.96)","insert into \\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", ' +
            '\\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Telford\', ' +
            '\'quite nice but small\', \'Chisels Unlimited Ltd\', \'16 Shrewsbury St\', \'Victoria Business Park\', \'Telford\', \'Shropshire\', \'TF2 8XD\', \'GB\')",' +
            '"insert into \\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Telford\', \'H78D\')"]'
        );
      });

      it('should create insert statements without the "insert" keyword', () => {
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.insert())).toBe(
          '["\\\"stock\\\" (\\\"company\\\", \\\"sku\\\", \\\"description\\\") values (\'ANA191\', \'DX676\', \'Hammer\'), (\'ANA191\', \'DX678\', \'Chisel\')","\\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Chesterfield\', \'grotty\', \'Tools 4 U Ltd\', \'29 Sudbury Lane\', \'\', \'Chesterfield\', \'Derbyshire\', \'S40 9DS\', \'GB\'), (\'ANA191\', \'Wolverhampton\', \'even grottier\', \'Hammer Time Ltd\', \'45 Strawberry St\', \'\', \'Wolverhampton\', \'West Midlands\', \'WV17 9JK\', \'GB\')","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Chesterfield\', \'FA76D2\'), (\'ANA191\', \'Chesterfield\', \'GA15A3\')","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-06-14 09:12:54\', 5, 98.34), (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-07-16 13:16:29\', 40, 95.32)","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'GA15A3\', \'2019-04-30 11:32:19\', 20, 96.41)","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Wolverhampton\', \'J16X\')","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Wolverhampton\', \'J16X\', \'2020-02-12 08:55:19\', 200, 84.96)","\\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Telford\', \'quite nice but small\', \'Chisels Unlimited Ltd\', \'16 Shrewsbury St\', \'Victoria Business Park\', \'Telford\', \'Shropshire\', \'TF2 8XD\', \'GB\')","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Telford\', \'H78D\')"]'
        )
      });

      it('should create insert ignore statements', () => {
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.insert())).toBe(
          '["\\\"stock\\\" (\\\"company\\\", \\\"sku\\\", \\\"description\\\") values (\'ANA191\', \'DX676\', \'Hammer\'), (\'ANA191\', \'DX678\', \'Chisel\')","\\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Chesterfield\', \'grotty\', \'Tools 4 U Ltd\', \'29 Sudbury Lane\', \'\', \'Chesterfield\', \'Derbyshire\', \'S40 9DS\', \'GB\'), (\'ANA191\', \'Wolverhampton\', \'even grottier\', \'Hammer Time Ltd\', \'45 Strawberry St\', \'\', \'Wolverhampton\', \'West Midlands\', \'WV17 9JK\', \'GB\')","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Chesterfield\', \'FA76D2\'), (\'ANA191\', \'Chesterfield\', \'GA15A3\')","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-06-14 09:12:54\', 5, 98.34), (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-07-16 13:16:29\', 40, 95.32)","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'GA15A3\', \'2019-04-30 11:32:19\', 20, 96.41)","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Wolverhampton\', \'J16X\')","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Wolverhampton\', \'J16X\', \'2020-02-12 08:55:19\', 200, 84.96)","\\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Telford\', \'quite nice but small\', \'Chisels Unlimited Ltd\', \'16 Shrewsbury St\', \'Victoria Business Park\', \'Telford\', \'Shropshire\', \'TF2 8XD\', \'GB\')","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Telford\', \'H78D\')"]'
        )
      });

      it('should create replace statements', () => {
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.Replace())).toBe(
          '["replace into \\\"stock\\\" (\\\"company\\\", \\\"sku\\\", \\\"description\\\") values (\'ANA191\', \'DX676\', \'Hammer\'), (\'ANA191\', \'DX678\', \'Chisel\')","replace into \\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Chesterfield\', \'grotty\', \'Tools 4 U Ltd\', \'29 Sudbury Lane\', \'\', \'Chesterfield\', \'Derbyshire\', \'S40 9DS\', \'GB\'), (\'ANA191\', \'Wolverhampton\', \'even grottier\', \'Hammer Time Ltd\', \'45 Strawberry St\', \'\', \'Wolverhampton\', \'West Midlands\', \'WV17 9JK\', \'GB\')","replace into \\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Chesterfield\', \'FA76D2\'), (\'ANA191\', \'Chesterfield\', \'GA15A3\')","replace into \\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-06-14 09:12:54\', 5, 98.34), (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-07-16 13:16:29\', 40, 95.32)","replace into \\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'GA15A3\', \'2019-04-30 11:32:19\', 20, 96.41)","replace into \\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Wolverhampton\', \'J16X\')","replace into \\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Wolverhampton\', \'J16X\', \'2020-02-12 08:55:19\', 200, 84.96)","replace into \\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Telford\', \'quite nice but small\', \'Chisels Unlimited Ltd\', \'16 Shrewsbury St\', \'Victoria Business Park\', \'Telford\', \'Shropshire\', \'TF2 8XD\', \'GB\')","replace into \\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Telford\', \'H78D\')"]'
        );
      });

      it('should create replace statements without replace keyword', () => {
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.replace())).toBe(
          '["\\\"stock\\\" (\\\"company\\\", \\\"sku\\\", \\\"description\\\") values (\'ANA191\', \'DX676\', \'Hammer\'), (\'ANA191\', \'DX678\', \'Chisel\')","\\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Chesterfield\', \'grotty\', \'Tools 4 U Ltd\', \'29 Sudbury Lane\', \'\', \'Chesterfield\', \'Derbyshire\', \'S40 9DS\', \'GB\'), (\'ANA191\', \'Wolverhampton\', \'even grottier\', \'Hammer Time Ltd\', \'45 Strawberry St\', \'\', \'Wolverhampton\', \'West Midlands\', \'WV17 9JK\', \'GB\')","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Chesterfield\', \'FA76D2\'), (\'ANA191\', \'Chesterfield\', \'GA15A3\')","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-06-14 09:12:54\', 5, 98.34), (\'ANA191\', \'DX676\', \'Chesterfield\', \'FA76D2\', \'2019-07-16 13:16:29\', 40, 95.32)","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Chesterfield\', \'GA15A3\', \'2019-04-30 11:32:19\', 20, 96.41)","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Wolverhampton\', \'J16X\')","\\\"inventory\\\" (\\\"company\\\", \\\"sku\\\", \\\"warehouse_name\\\", \\\"bin\\\", \\\"time\\\", \\\"qty\\\", \\\"cost\\\") values (\'ANA191\', \'DX676\', \'Wolverhampton\', \'J16X\', \'2020-02-12 08:55:19\', 200, 84.96)","\\\"s1\\\".\\\"warehouse\\\" (\\\"company\\\", \\\"name\\\", \\\"description\\\", \\\"address_company\\\", \\\"address_street\\\", \\\"address_locality\\\", \\\"address_city\\\", \\\"address_region\\\", \\\"address_postalCode\\\", \\\"address_country\\\") values (\'ANA191\', \'Telford\', \'quite nice but small\', \'Chisels Unlimited Ltd\', \'16 Shrewsbury St\', \'Victoria Business Park\', \'Telford\', \'Shropshire\', \'TF2 8XD\', \'GB\')","\\\"warehouse_bins\\\" (\\\"company\\\", \\\"warehouse_name\\\", \\\"bin\\\") values (\'ANA191\', \'Telford\', \'H78D\')"]'
        );
      });

      it('should create delete statements', () => {
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.Delete())).toBe(
          '["delete \\\"stock\\\" from \\\"stock\\\" where \\\"stock\\\".\\\"company\\\" = \'ANA191\' and \\\"stock\\\".\\\"sku\\\" = \'DX676\'","delete \\\"w1\\\" from \\\"s1\\\".\\\"warehouse\\\" as \\\"w1\\\" where \\\"w1\\\".\\\"company\\\" = \'ANA191\' and \\\"w1\\\".\\\"name\\\" = \'Chesterfield\'","delete \\\"warehouse_bins\\\" from \\\"warehouse_bins\\\" where \\\"warehouse_bins\\\".\\\"company\\\" = \'ANA191\' and \\\"warehouse_bins\\\".\\\"warehouse_name\\\" = \'Chesterfield\' and \\\"warehouse_bins\\\".\\\"bin\\\" = \'FA76D2\'","delete \\\"inventory\\\" from \\\"inventory\\\" where \\\"inventory\\\".\\\"company\\\" = \'ANA191\' and \\\"inventory\\\".\\\"sku\\\" = \'DX676\' and \\\"inventory\\\".\\\"warehouse_name\\\" = \'Chesterfield\' and \\\"inventory\\\".\\\"bin\\\" = \'FA76D2\' and \\\"inventory\\\".\\\"time\\\" = \'2019-06-14 09:12:54\'","delete \\\"inventory\\\" from \\\"inventory\\\" where \\\"inventory\\\".\\\"company\\\" = \'ANA191\' and \\\"inventory\\\".\\\"sku\\\" = \'DX676\' and \\\"inventory\\\".\\\"warehouse_name\\\" = \'Chesterfield\' and \\\"inventory\\\".\\\"bin\\\" = \'FA76D2\' and \\\"inventory\\\".\\\"time\\\" = \'2019-07-16 13:16:29\'","delete \\\"warehouse_bins\\\" from \\\"warehouse_bins\\\" where \\\"warehouse_bins\\\".\\\"company\\\" = \'ANA191\' and \\\"warehouse_bins\\\".\\\"warehouse_name\\\" = \'Chesterfield\' and \\\"warehouse_bins\\\".\\\"bin\\\" = \'GA15A3\'","delete \\\"inventory\\\" from \\\"inventory\\\" where \\\"inventory\\\".\\\"company\\\" = \'ANA191\' and \\\"inventory\\\".\\\"sku\\\" = \'DX676\' and \\\"inventory\\\".\\\"warehouse_name\\\" = \'Chesterfield\' and \\\"inventory\\\".\\\"bin\\\" = \'GA15A3\' and \\\"inventory\\\".\\\"time\\\" = \'2019-04-30 11:32:19\'","delete \\\"w1\\\" from \\\"s1\\\".\\\"warehouse\\\" as \\\"w1\\\" where \\\"w1\\\".\\\"company\\\" = \'ANA191\' and \\\"w1\\\".\\\"name\\\" = \'Wolverhampton\'","delete \\\"warehouse_bins\\\" from \\\"warehouse_bins\\\" where \\\"warehouse_bins\\\".\\\"company\\\" = \'ANA191\' and \\\"warehouse_bins\\\".\\\"warehouse_name\\\" = \'Wolverhampton\' and \\\"warehouse_bins\\\".\\\"bin\\\" = \'J16X\'","delete \\\"inventory\\\" from \\\"inventory\\\" where \\\"inventory\\\".\\\"company\\\" = \'ANA191\' and \\\"inventory\\\".\\\"sku\\\" = \'DX676\' and \\\"inventory\\\".\\\"warehouse_name\\\" = \'Wolverhampton\' and \\\"inventory\\\".\\\"bin\\\" = \'J16X\' and \\\"inventory\\\".\\\"time\\\" = \'2020-02-12 08:55:19\'","delete \\\"stock\\\" from \\\"stock\\\" where \\\"stock\\\".\\\"company\\\" = \'ANA191\' and \\\"stock\\\".\\\"sku\\\" = \'DX678\'","delete \\\"w1\\\" from \\\"s1\\\".\\\"warehouse\\\" as \\\"w1\\\" where \\\"w1\\\".\\\"company\\\" = \'ANA191\' and \\\"w1\\\".\\\"name\\\" = \'Telford\'","delete \\\"warehouse_bins\\\" from \\\"warehouse_bins\\\" where \\\"warehouse_bins\\\".\\\"company\\\" = \'ANA191\' and \\\"warehouse_bins\\\".\\\"warehouse_name\\\" = \'Telford\' and \\\"warehouse_bins\\\".\\\"bin\\\" = \'H78D\'"]'
        );
      });

    });

    describe('stock_with_options tests', () => {

      const j = joins.stock_with_options;

      it('should create a record with one option set', () => {
        const lines = [
          {
            company: 'ACE010',
            sku: 'AA934',
            description: 'Hammer',
            options_company: 'ACE010',
            options_sku: 'AA934',
            options_weight: 0.45,
            options_length: 28,
            options_width: 14,
            options_height: 8
          }
        ];
        const recordSet = j.collate(lines);
        expect(JSON.stringify(recordSet)).toBe(
          '[{"company":"ACE010","sku":"AA934","description":"Hammer","options":{"company":"ACE010","sku":"AA934","weight":0.45,"length":28,"width":14,"height":8}}]'
        );
      });

      it('should create a record with zero options set', () => {
        const lines = [
          {
            company: 'ACE010',
            sku: 'AA934',
            description: 'Hammer',
            options_company: null,
            options_sku: null,
            options_weight: null,
            options_length: null,
            options_width: null,
            options_height: null
          }
        ];
        const recordSet = j.collate(lines);
        expect(JSON.stringify(recordSet)).toBe(
          '[{"company":"ACE010","sku":"AA934","description":"Hammer"}]'
        );
      });

    });

  });

  describe('tests with subqueries and views', () => {

    const sq1 = joins.orders.view({
      name: 'orders',
      schema: 'views',
      selector: ['company', 'order_id', 'lines'],
      query: ({ table, selector }) => table.SelectWhere(selector, { company: 'ABC001' })
    }).subquery({
      alias: 'sq1'
    });

    const sq2 = joins.inventory2.view({
      name: 'inventory',
      schema: 'views',
      selector: ['company', 'sku', 'warehouse']
    }).subquery({
      alias: 'sq2'
    });

    describe('j1 tests', () => {

      const j1 = sq1.join({
        name: 'inventory',
        table: sq2,
        on: ['company', 'sku:lines_sku']
      });

      it('should collate single line', () => {
        const line = {
          company: 'ABC001',
          order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          lines_company: 'ABC001',
          lines_order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          lines_line_no: 1,
          lines_sku: 'ADS134',
          lines_description: 'Spice Rack',
          lines_qty: 1,
          lines_price: 13.65,
          inventory_sku: 'ADS134',
          inventory_warehouse_company: 'ABC001',
          inventory_warehouse_name: 'Mercury',
          inventory_warehouse_description: 'Warm and cosy',
          inventory_address_company: 'ABC Ltd',
          inventory_address_street: '52 Wellington St',
          inventory_address_locality: 'Angelborough',
          inventory_address_city: 'Bristol',
          inventory_address_region: 'Avon',
          inventory_address_postalCode: 'BS2 5HD',
          inventory_address_country: 'GB',
          inventory_warehouse_bins_company: 'ABC001',
          inventory_warehouse_bins_warehouse_name: 'Mercury',
          inventory_warehouse_bins_bin: 'F56D',
          inventory_warehouse_bins_inventory_company: 'ABC001',
          inventory_warehouse_bins_inventory_sku: 'ADS134',
          inventory_warehouse_bins_inventory_warehouse_name: 'Mercury',
          inventory_warehouse_bins_inventory_bin: 'F56D',
          inventory_warehouse_bins_inventory_time: '2018-06-14 14:32:19',
          inventory_warehouse_bins_inventory_qty: 200,
          inventory_warehouse_bins_inventory_cost: 7.46
        };
        expect(JSON.stringify(j1.collate(line))).toBe(
          '[{"company":"ABC001","order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4","lines":[{"company":"ABC001","order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4",' +
            '"line_no":1,"sku":"ADS134","description":"Spice Rack","qty":1,"price":13.65}],"inventory":[{"company":"ABC001","sku":"ADS134","warehouse":[{"company":"ABC001",' +
            '"name":"Mercury","description":"Warm and cosy","address":{"company":"ABC Ltd","street":"52 Wellington St","locality":"Angelborough",' +
            '"city":"Bristol","region":"Avon","postalCode":"BS2 5HD","country":"GB"},"bins":[{"company":"ABC001","warehouse_name":"Mercury","bin":"F56D",' +
            '"inventory":[{"company":"ABC001","sku":"ADS134","warehouse_name":"Mercury","bin":"F56D","time":"2018-06-14 14:32:19","qty":200,"cost":7.46}]}]}]}]}]'
        );
      });
      
      it('should collate single line with some joined columns missing', () => {
        const line = {
          company: 'ABC001',
          order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          lines_company: 'ABC001',
          lines_order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          lines_line_no: 1,
          lines_sku: 'ADS134',
          lines_description: 'Spice Rack',
          lines_qty: 1,
          lines_price: 13.65,
          inventory_warehouse_name: 'Mercury',
          inventory_warehouse_description: 'Warm and cosy',
          inventory_address_company: 'ABC Ltd',
          inventory_address_street: '52 Wellington St',
          inventory_address_locality: 'Angelborough',
          inventory_address_city: 'Bristol',
          inventory_address_region: 'Avon',
          inventory_address_postalCode: 'BS2 5HD',
          inventory_address_country: 'GB',
          inventory_warehouse_bins_company: 'ABC001',
          inventory_warehouse_bins_bin: 'F56D',
          inventory_warehouse_bins_inventory_bin: 'F56D',
          inventory_warehouse_bins_inventory_time: '2018-06-14 14:32:19',
          inventory_warehouse_bins_inventory_qty: 200,
          inventory_warehouse_bins_inventory_cost: 7.46
        };
        expect(JSON.stringify(j1.collate(line))).toBe(
          '[{"company":"ABC001","order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4","lines":[{"company":"ABC001","order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4",' +
            '"line_no":1,"sku":"ADS134","description":"Spice Rack","qty":1,"price":13.65}],"inventory":[{"company":"ABC001","sku":"ADS134","warehouse":[{"company":"ABC001",' +
            '"name":"Mercury","description":"Warm and cosy","address":{"company":"ABC Ltd","street":"52 Wellington St","locality":"Angelborough",' +
            '"city":"Bristol","region":"Avon","postalCode":"BS2 5HD","country":"GB"},"bins":[{"company":"ABC001","warehouse_name":"Mercury","bin":"F56D",' +
            '"inventory":[{"company":"ABC001","sku":"ADS134","warehouse_name":"Mercury","bin":"F56D","time":"2018-06-14 14:32:19","qty":200,"cost":7.46}]}]}]}]}]'
        );
      });
    });

    describe('j2 tests', () => {

      const j2 = sq2.join({
        name: 'orders',
        table: sq1,
        on: ['company', 'lines_sku:sku']
      });

      it('should collate single line', () => {
        const line = {
          company: 'ABC001',
          sku: 'ADS134',
          warehouse_company: 'ABC001',
          warehouse_name: 'Mercury',
          warehouse_description: 'Warm and cosy',
          address_company: 'ABC Ltd',
          address_street: '52 Wellington St',
          address_locality: 'Angelborough',
          address_city: 'Bristol',
          address_region: 'Avon',
          address_postalCode: 'BS2 5HD',
          address_country: 'GB',
          warehouse_bins_company: 'ABC001',
          warehouse_bins_warehouse_name: 'Mercury',
          warehouse_bins_bin: 'F56D',
          warehouse_bins_inventory_company: 'ABC001',
          warehouse_bins_inventory_sku: 'ADS134',
          warehouse_bins_inventory_warehouse_name: 'Mercury',
          warehouse_bins_inventory_bin: 'F56D',
          warehouse_bins_inventory_time: '2018-06-14 14:32:19',
          warehouse_bins_inventory_qty: 200,
          warehouse_bins_inventory_cost: 7.46,
          orders_company: 'ABC001',
          orders_order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          orders_lines_company: 'ABC001',
          orders_lines_order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          orders_lines_line_no: 1,
          orders_lines_sku: 'ADS134',
          orders_lines_description: 'Spice Rack',
          orders_lines_qty: 1,
          orders_lines_price: 13.65,
        }
        expect(JSON.stringify(j2.collate(line))).toBe(
          '[{"company":"ABC001","sku":"ADS134","warehouse":[{"company":"ABC001","name":"Mercury","description":"Warm and cosy","address":{"company":"ABC Ltd",' +
            '"street":"52 Wellington St","locality":"Angelborough","city":"Bristol","region":"Avon","postalCode":"BS2 5HD","country":"GB"},"bins":[{"company":"ABC001",' +
            '"warehouse_name":"Mercury","bin":"F56D","inventory":[{"company":"ABC001","sku":"ADS134","warehouse_name":"Mercury","bin":"F56D","time":"2018-06-14 14:32:19",' +
            '"qty":200,"cost":7.46}]}]}],"orders":[{"company":"ABC001","order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4","lines":[{"company":"ABC001",' +
            '"order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4","line_no":1,"sku":"ADS134","description":"Spice Rack","qty":1,"price":13.65}]}]}]'
        );
      });

      it('should collate single line with some joined fields missing', () => {
        const line = {
          company: 'ABC001',
          sku: 'ADS134',
          warehouse_company: 'ABC001',
          warehouse_name: 'Mercury',
          warehouse_description: 'Warm and cosy',
          address_company: 'ABC Ltd',
          address_street: '52 Wellington St',
          address_locality: 'Angelborough',
          address_city: 'Bristol',
          address_region: 'Avon',
          address_postalCode: 'BS2 5HD',
          address_country: 'GB',
          warehouse_bins_company: 'ABC001',
          warehouse_bins_warehouse_name: 'Mercury',
          warehouse_bins_bin: 'F56D',
          warehouse_bins_inventory_company: 'ABC001',
          warehouse_bins_inventory_sku: 'ADS134',
          warehouse_bins_inventory_warehouse_name: 'Mercury',
          warehouse_bins_inventory_bin: 'F56D',
          warehouse_bins_inventory_time: '2018-06-14 14:32:19',
          warehouse_bins_inventory_qty: 200,
          warehouse_bins_inventory_cost: 7.46,
          orders_company: 'ABC001',
          orders_order_id: '785858bb-8b33-4fe3-bfea-0b2f1d67cfb4',
          orders_lines_company: 'ABC001',
          orders_lines_line_no: 1,
          orders_lines_sku: 'ADS134',
          orders_lines_description: 'Spice Rack',
          orders_lines_qty: 1,
          orders_lines_price: 13.65,
        }
        expect(JSON.stringify(j2.collate(line))).toBe(
          '[{"company":"ABC001","sku":"ADS134","warehouse":[{"company":"ABC001","name":"Mercury","description":"Warm and cosy","address":{"company":"ABC Ltd",' +
            '"street":"52 Wellington St","locality":"Angelborough","city":"Bristol","region":"Avon","postalCode":"BS2 5HD","country":"GB"},"bins":[{"company":"ABC001",' +
            '"warehouse_name":"Mercury","bin":"F56D","inventory":[{"company":"ABC001","sku":"ADS134","warehouse_name":"Mercury","bin":"F56D","time":"2018-06-14 14:32:19",' +
            '"qty":200,"cost":7.46}]}]}],"orders":[{"company":"ABC001","order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4","lines":[{"company":"ABC001",' +
            '"order_id":"785858bb-8b33-4fe3-bfea-0b2f1d67cfb4","line_no":1,"sku":"ADS134","description":"Spice Rack","qty":1,"price":13.65}]}]}]'
        );
      });

    });

  });

  describe('reducer tests', () => {

    const table = tables.company_options;
    const lines = [
      {
        company: 'ABA190',
        key_id: 'businessType',
        value: 'Warehousing'
      },
      {
        company: 'ABA190',
        key_id: 'Managing Director',
        value: 'Leslie Burnstock'
      },
      {
        company: 'JJE124',
        key_id: 'businessType',
        value: 'Retail'
      },
      {
        company: 'JJE124',
        key_id: 'Managing Director',
        value: 'Terry Mountford'
      }
    ];

    it('should collate table records using reducer', () => {
      expect(JSON.stringify(table.collate(lines))).toBe(
        '{"ABA190":{"businessType":"Warehousing","Managing Director":"Leslie Burnstock"},"JJE124":{"businessType":"Retail","Managing Director":"Terry Mountford"}}'
      );
    });

    it('should collate table records using reducer, producing plain JSON', () => {
      expect(table.collate(lines, { json: true })).toEqual(
        {
          ABA190: {
            businessType: 'Warehousing',
            'Managing Director': 'Leslie Burnstock'
          },
          JJE124: {
            businessType: 'Retail',
            'Managing Director': 'Terry Mountford'
          }
        }
      );
    });

    it('should collate table records using a custom reducer, producing plain JSON', () => {
      expect(table.collate(lines, {
        json: true,
        reducer: (acc, record) => {
          const { company, key_id, value } = record.toJSON();
          if(acc === undefined) {
            acc = {};
          }
          if(!acc[company]) {
            acc[company] = [];
          }
          acc[company].push({ key: key_id, value });
          return acc;
        }
      })).toEqual(
        {
          ABA190: [
            {
              key: 'businessType',
              value: 'Warehousing'
            },
            {
              key: 'Managing Director',
              value: 'Leslie Burnstock'
            }
          ],
          JJE124: [
            {
              key: 'businessType',
              value: 'Retail'
            },
            {
              key: 'Managing Director',
              value: 'Terry Mountford'
            }
          ]
        }
      );
    });

  });

  describe('Computed value tests', () => {

    const { Table } = require('../index');

    const t = new Table({
      name: 'a',
      columns: [
        { name: 'a1', type: 'varchar(255)', notNull: true, primaryKey: true },
        { name: 'a2', type: 'datetime' },
        { name: 'a3', type: 'varchar(255)' }
      ]
    });

    it('should insert record with computed fields', () => {
      const records = t.toRecordSet({
        a1: ({ sql }) => 'a',
        a2: ({ sql }) => sql`now()`,
        a3: ({ sql }) => null
      });
      expect(records.insertValues()).toEqual(
        ['(\'a\', now(), null)']
      );
      expect(records.Insert()).toEqual(
        ['insert into "a" ("a1", "a2", "a3") values (\'a\', now(), null)']
      );
    });


  });

});
