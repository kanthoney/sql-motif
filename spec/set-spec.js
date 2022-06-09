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
        expect(j.set({
          company: 'ACME001',
          sku: 'AFJ010',
          description: 'Spirit level',
          warehouse: {
            name: 'Mercury',
            bins: {
              bin: 'A14J',
              inventory: {
                qty: motif.Fn('min', 5, 6),
                time: ({ col, sql, context }) => sql`${col} - interval ${context.days || 1} day`
              }
            }
          }
        }, { context: { days: 5 } })).toBe(
          '"stock"."company" = \'ACME001\', "stock"."sku" = \'AFJ010\', "stock"."description" = \'Spirit level\', "w1"."name" = \'Mercury\', "warehouse_bins"."bin" = \'A14J\', ' +
            '"inventory"."time" = "inventory"."time" - interval 5 day, "inventory"."qty" = min(5, 6)'
        );
      });

    });

  });

  describe('storeAs tests', () => {

    const { Table } = require('../index');

    const t = new Table({
      name: 'a',
      columns: [
        { name: 'a', type: 'int', storeAs: v => (v ?? '') === ''?null:v },
        { name: 'b', type: 'text', storeAs: v => JSON.stringify(v), format: v => JSON.parse(v) }
      ]
    });

    it('should create set record', () => {
      expect(t.Set({ a: 2, b: { a: 1 } })).toBe('set "a"."a" = 2, "a"."b" = \'{"a":1}\'');
    });

    it('should create set record with empty a', () => {
      expect(t.Set({ a: '', b: { a: 1 } })).toBe('set "a"."a" = null, "a"."b" = \'{"a":1}\'');
    });

  });

});
