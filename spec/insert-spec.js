'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('insert tests', () => {

  describe('orders tests', () => {

    const t = tables.orders;

    it('should insert an order', () => {
      expect(t.Insert([{
        company: 'GJD001',
        order_id: 14,
        order_date: '2020-03-17',
        customer: 'TTT010',
        delivery: {
          name: 'Terry Test',
          address: {
            company: '',
            street: '18 Highfield St',
            locality: '',
            city: 'Birmingham',
            region: 'West Midlands',
            postalCode: 'B18 9LK',
            country: 'GB'
          }
        },
        invoice: {
          name: 'Terry Test',
          address: {
            company: '',
            street: '18 Highfield St',
            locality: '',
            city: 'Birmingham',
            region: 'West Midlands',
            postalCode: 'B18 9LK',
            country: 'GB'
          }
        }
      },
      {
        company: 'GJD001',
        order_id: 15,
        order_date: '2020-03-17',
        customer: 'NGT010',
        delivery: {
          name: 'Nobby Test',
          address: {
            company: '',
            street: '64 Horseferry St',
            locality: '',
            city: 'Manchester',
            region: '',
            postalCode: 'M15 6DJ',
            country: 'GB'
          }
        },
        invoice: {
          name: 'Terry Test',
          address: {
            street: '18 Highfield St',
            city: 'Birmingham',
            region: 'West Midlands',
            postalCode: 'B18 9LK',
            country: 'GB'
          }
        }
      }])).toBe(
        'insert into "s1"."orders" ("company", "order_id", "order_date", "customer", "delivery_name", "delivery_address_company", "delivery_address_street", ' +
        '"delivery_address_locality", "delivery_address_city", "delivery_address_region", "delivery_address_postalCode", "delivery_address_country", ' +
        '"billing_name", "billing_address_company", "billing_address_street", "billing_address_locality", "billing_address_city", "billing_address_region", ' +
        '"billing_address_postalCode", "billing_address_country") values (\'GJD001\', 14, \'2020-03-17\', \'TTT010\', \'Terry Test\', \'\', \'18 Highfield St\', ' +
        '\'\', \'Birmingham\', \'West Midlands\', \'B18 9LK\', \'GB\', \'Terry Test\', \'\', \'18 Highfield St\', \'\', \'Birmingham\', \'West Midlands\', \'B18 9LK\', \'GB\'), ' +
        '(\'GJD001\', 15, \'2020-03-17\', \'NGT010\', \'Nobby Test\', \'\', \'64 Horseferry St\', \'\', \'Manchester\', \'\', \'M15 6DJ\', \'GB\', \'Terry Test\', default, ' +
        '\'18 Highfield St\', default, \'Birmingham\', \'West Midlands\', \'B18 9LK\', \'GB\')'
      );
    });

    it('should insert ignore two orders', () => {
      expect(t.InsertIgnore([{
        company: 'GJD001',
        order_id: 14,
        order_date: ({ sql }) => sql`curdate()`,
        customer: null,
        delivery: {
          name: 'Terry Test',
          address: {
            company: '',
            street: '18 Highfield St',
            locality: '',
            city: 'Birmingham',
            region: 'West Midlands',
            postalCode: 'B18 9LK',
            country: 'GB'
          }
        },
        invoice: {
          name: 'Terry Test',
          address: {
            company: '',
            street: '18 Highfield St',
            locality: '',
            city: 'Birmingham',
            region: 'West Midlands',
            postalCode: 'B18 9LK',
            country: 'GB'
          }
        }
      },
      {
        company: 'GJD001',
        order_id: 15,
        order_date: ({ sql }) => sql`curdate()`,
        customer: 'NGT010',
        delivery: {
          name: 'Nobby Test',
          address: {
            company: '',
            street: '64 Horseferry St',
            locality: '',
            city: 'Manchester',
            region: '',
            postalCode: 'M15 6DJ',
            country: 'GB'
          }
        },
        invoice: {
          name: 'Terry Test',
          address: {
            street: '18 Highfield St',
            city: 'Birmingham',
            region: 'West Midlands',
            postalCode: 'B18 9LK',
            country: 'GB'
          }
        }
      }])).toBe(
        'insert ignore into "s1"."orders" ("company", "order_id", "order_date", "customer", "delivery_name", "delivery_address_company", "delivery_address_street", ' +
        '"delivery_address_locality", "delivery_address_city", "delivery_address_region", "delivery_address_postalCode", "delivery_address_country", ' +
        '"billing_name", "billing_address_company", "billing_address_street", "billing_address_locality", "billing_address_city", "billing_address_region", ' +
        '"billing_address_postalCode", "billing_address_country") values (\'GJD001\', 14, curdate(), null, \'Terry Test\', \'\', \'18 Highfield St\', ' +
        '\'\', \'Birmingham\', \'West Midlands\', \'B18 9LK\', \'GB\', \'Terry Test\', \'\', \'18 Highfield St\', \'\', \'Birmingham\', \'West Midlands\', \'B18 9LK\', \'GB\'), ' +
        '(\'GJD001\', 15, curdate(), \'NGT010\', \'Nobby Test\', \'\', \'64 Horseferry St\', \'\', \'Manchester\', \'\', \'M15 6DJ\', \'GB\', \'Terry Test\', default, ' +
        '\'18 Highfield St\', default, \'Birmingham\', \'West Midlands\', \'B18 9LK\', \'GB\')'
      );
    });

  });

});
