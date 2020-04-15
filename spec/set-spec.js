'use strict';

const tables = require('./tables');
const joins = require('./joins');
const motif = require('../index');

describe('set tests', () => {

  describe('table tests', () => {

    describe('orders table', () => {

      const t = tables.orders;

      it('should create set clause for delivery address', () => {
        expect(t.set({
          delivery: {
            address: {
              company: 'ACME Ltd',
              street: '8 Highfield Court',
              locality: 'Mercury Business Park',
              city: 'Warrington',
              region: 'Cheshire',
              postalCode: 'WA3 9NJ',
              country: 'GB'
            }
          }
        })).toBe(
          '"s1"."orders"."delivery_address_company" = \'ACME Ltd\', "s1"."orders"."delivery_address_street" = \'8 Highfield Court\', ' +
          '"s1"."orders"."delivery_address_locality" = \'Mercury Business Park\', "s1"."orders"."delivery_address_city" = \'Warrington\', '  +
          '"s1"."orders"."delivery_address_region" = \'Cheshire\', "s1"."orders"."delivery_address_postalCode" = \'WA3 9NJ\', "s1"."orders"."delivery_address_country" = \'GB\''
        );
      });

    });

  });

  describe('join tests', () => {

    describe('inventory2 tests', () => {
      const j = joins.inventory2;

      it("should create set clause for inventory", () => {
        const sql = j.dialect.template;
        expect(j.set({
          company: 'ACME001',
          sku: 'AFJ010',
          description: 'Spirit level',
          warehouse: {
            name: 'Mercury',
            bins: {
              bin: 'A14J',
              inventory: {
                qty: motif.fn('min', 5, 6),
                time: (col, tag) => tag`${col} - interval 5 day`
              }
            }
          }
        })).toBe(
          '"stock"."company" = \'ACME001\', "stock"."sku" = \'AFJ010\', "stock"."description" = \'Spirit level\', "s1"."warehouse"."name" = \'Mercury\', ' +
          '"warehouse_bins"."bin" = \'A14J\', "inventory"."time" = "inventory"."time" - interval 5 day, "inventory"."qty" = min(5, 6)'
        );
      });

    });

  });

});
