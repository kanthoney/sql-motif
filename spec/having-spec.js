'use strict';

const tables = require('./tables')
const joins = require('./joins');
const op = require('../src/operators');
const motif = require('../index');
const snippet = require('../src/snippet');
const and = require('../src/and');
const Verbatim = require('../src/verbatim');

describe('having tests', () => {

  describe('table tests', () => {

    describe('order tests', () => {

      const t = tables.orders;

      it("should select orders having company is 'ACE010'", () => {
        expect(t.Having({ company: 'ACE001' })).toBe(
          'having "s1"."orders"."company" = \'ACE001\''
        );
      });

      it("should select orders having company is 'ACE010' and customer is 'BXY001'", () => {
        expect(t.Having({ company: 'ACE010', customer: 'BXY001' })).toBe(
          'having "s1"."orders"."company" = \'ACE010\' and "s1"."orders"."customer" = \'BXY001\''
        );
      });

      it("should select orders from company 'ACE010' after date '2020-04-14'", () => {
        expect(t.Having({ company: 'ACE010', order_date: op.ge('2020-04-14') })).toBe(
          'having "s1"."orders"."company" = \'ACE010\' and "s1"."orders"."order_date" >= \'2020-04-14\''
        );
      });

      it("should select orders from company 'ACE010' after '2020-04-14' and orders from 'BCX002' before '2020-01-01'", () => {
        expect(t.Having([
          { company: 'ACE010', order_date: op.gt('2020-04-14') },
          { company: 'BCX001', order_date: op.lt('2020-01-01') }
        ])).toBe(
          'having ("s1"."orders"."company" = \'ACE010\' and "s1"."orders"."order_date" > \'2020-04-14\') or ("s1"."orders"."company" = \'BCX001\' and "s1"."orders"."order_date" < \'2020-01-01\')'
        )
      });

      it("should select orders having delivery name is 'Terry Test'", () => {
        expect(t.Having({ delivery: { name: 'Terry Test' } })).toBe(
          'having "s1"."orders"."delivery_name" = \'Terry Test\''
        );
      });

      it("should select orders having delivery name is 'Terry Test' and invoice country is 'GB'", () => {
        expect(t.Having({ delivery: { name: 'Terry Test' }, invoice: { address: { country: 'GB' } } })).toBe(
          'having "s1"."orders"."delivery_name" = \'Terry Test\' and "s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it("should select orders having delivery name is 'Terry Test' and invoice country is 'GB' and street is 'St. John's Street'", () => {
        expect(t.Having({ delivery: { name: 'Terry Test' }, invoice: { address: { street: "St. John's Street", country: 'GB' } } })).toBe(
          'having "s1"."orders"."delivery_name" = \'Terry Test\' and "s1"."orders"."billing_address_street" = \'St. John\'\'s Street\' and ' +
            '"s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it("should select orders having delivery name is 'Barney \"Rubble\" Rimmington' and invoice country is 'GB'", () => {
        expect(t.Having({ delivery: { name: 'Barney "Rubble" Rimmington' }, invoice: { address: { country: 'GB' } } })).toBe(
          'having "s1"."orders"."delivery_name" = \'Barney "Rubble" Rimmington\' and "s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it('should select orders before today', () => {
        expect(t.Having({ order_date: op.lt(motif.Fn('curdate')) })).toBe(
          'having "s1"."orders"."order_date" < curdate()'
        );
      });

      it("should select orders having delivery street is '20 Highfield Street' or delivery city is 'Manchester'", () => {
        expect(t.Having({ delivery: { address: [ { street: '20 Highfield Street' }, { city: 'Manchester' } ] } })).toBe(
          'having ("s1"."orders"."delivery_address_street" = \'20 Highfield Street\' or "s1"."orders"."delivery_address_city" = \'Manchester\')'
        );
      });

      it("should select orders having customer is 'KJA001' and delivery street is '20 Highfield Street' or delivery city is 'Manchester'", () => {
        expect(t.Having({ customer: 'KJA001', delivery: { address: [ { street: '20 Highfield Street' }, { city: 'Manchester' } ] } })).toBe(
          'having "s1"."orders"."customer" = \'KJA001\' and ("s1"."orders"."delivery_address_street" = \'20 Highfield Street\' or "s1"."orders"."delivery_address_city" = \'Manchester\')'
        );
      });

      it('should create a having clause with several records ored together', () => {
        expect(t.Having([{ company: 'ACME01', order_id: 49 }, { company: 'WIL002', order_id: 94 }])).toBe(
          'having ("s1"."orders"."company" = \'ACME01\' and "s1"."orders"."order_id" = 49) or ("s1"."orders"."company" = \'WIL002\' and "s1"."orders"."order_id" = 94)'
        );
      });

      it('should create a having clause with delivery name fields ored together', () => {
        expect(t.Having({ company: 'ACME01', delivery: { name: [ 'Alice', 'Bob' ] } })).toBe(
          'having "s1"."orders"."company" = \'ACME01\' and ("s1"."orders"."delivery_name" = \'Alice\' or "s1"."orders"."delivery_name" = \'Bob\')'
        );
      });

      it('it should create a having clause with a complex or subclause', () => {
        expect(t.Having({ company: 'ACME01', [snippet]: [ { order_id: 5 }, { delivery: { name: 'Alice', address: { street: 'Greenway st.' } } } ] }))
          .toBe(
            'having "s1"."orders"."company" = \'ACME01\' and ("s1"."orders"."order_id" = 5 or ("s1"."orders"."delivery_name" = \'Alice\' and ' +
              '"s1"."orders"."delivery_address_street" = \'Greenway st.\'))'
          );
      });

      it('should create a having clause with a functional and clause', () => {
        expect(t.Having({ company: 'ACME01', [and]: ({ table, sql }) => sql`ifnull(${table.column('order_id')}, 0) = 0` })).toBe(
          'having "s1"."orders"."company" = \'ACME01\' and ifnull("s1"."orders"."order_id", 0) = 0'
        );
      });

      it('should create a having clause with an or clause with functional and verbatim components', () => {
        expect(t.Having({ company: 'ACME01', [and]: [({ table, sql }) => sql`ifnull(${table.column('order_id')}, 0) = 0`, Verbatim('now() < \'2020-12-05\'')] })).toBe(
          'having "s1"."orders"."company" = \'ACME01\' and (ifnull("s1"."orders"."order_id", 0) = 0 or now() < \'2020-12-05\')'
        );
      });

    });

    describe('order_lines tests', () => {

      const t = tables.order_lines;

      it("should select order lines having order_id = '123' and SKU = 'ADF1001'", () => {
        expect(t.Having({ order_id: 123, sku: 'ADF1001' })).toBe(
          'having "ol1"."order_id" = 123 and "ol1"."sku" = \'ADF1001\''
        );
      });

    });

  });

  describe('join tests', () => {

    describe('order join tests', () => {

      const j = joins.orders;

      it("should select orders having sku = 'JXC001'", () => {
        expect(j.Having({ lines: { sku: 'JXC001' } })).toBe(
          'having "ol1"."sku" = \'JXC001\''
        );
      });

      it("should select orders having order date is after 2020-04-01 with sku starting with 'HUT_$909'", () => {
        expect(j.Having({ order_date: op.gt('2020-04-01'), lines: { sku: op.startsWith('HUT_$909') } })).toBe(
          'having "s1"."orders"."order_date" > \'2020-04-01\' and "ol1"."sku" regexp \'^HUT_\\$909\''
        );
      });

      it("should select orders having sku does not contain 'DF^G'", () => {
        expect(j.Having({ lines: { sku: op.notContains('DF^G') } })).toBe(
          'having "ol1"."sku" not regexp \'DF\\^G\''
        );
      });

    });

    describe('inventory join tests', () => {

      const j = joins.inventory;

      it("should find inventory having sku = 'DDJ9823' and qty > 0", () => {
        expect(j.Having({ sku: 'DDJ9823', inventory: { qty: op.gt(0) } })).toBe(
          'having "stock"."sku" = \'DDJ9823\' and "i1"."qty" > 0'
        );
      });

      it("should find inventory having bin code begins with A or B and qty = 0", () => {
        expect(j.Having({ bin: { bin: op.regExp('^[AB]') }, inventory: { qty: 0 } })).toBe(
          'having "warehouse_bins"."bin" regexp \'^[AB]\' and "i1"."qty" = 0'
        );
      });

    });

    describe('inventory2 tests', () => {
      const j = joins.inventory2;

      it("should create having clause for inventory", () => {
        expect(j.Having({
          company: 'ACME001',
          sku: 'AFJ010',
          description: 'Spirit level',
          warehouse: {
            name: 'Mercury',
            bins: [{
              bin: 'A14J',
              inventory: {
                qty: 5
              }
            }, {
              bin: 'A52A'
            }]
          }
        })).toBe(
          'having "stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "w1"."name" = \'Mercury\' and ' +
          '(("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = 5) or "warehouse_bins"."bin" = \'A52A\')'
        );
      });

      describe('and/or tests', () => {
        
        it('should produce a having clause with an and subclause', () => {
          expect(j.Having({
            company: 'ACME001',
            sku: 'AFJ010',
            description: 'Spirit level',
            warehouse: {
              name: 'Mercury',
              [and]: {
                description: 'a bit whiffy',
                bins: [{
                  bin: 'A14J',
                  inventory: {
                    qty: 5
                  }
                }, {
                  bin: 'A52A'
                }]
              }
            }
          })).toBe(
            'having "stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "w1"."name" = \'Mercury\' and ' +
              '("w1"."description" = \'a bit whiffy\' and (("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = 5) or "warehouse_bins"."bin" = \'A52A\'))'
          );
        });

        it('should produce a having clause with an or subclause', () => {
          expect(j.Having({
            company: 'ACME001',
            sku: 'AFJ010',
            description: 'Spirit level',
            warehouse: {
              name: 'Mercury',
              [snippet]: {
                description: 'a bit whiffy',
                bins: [{
                  bin: 'A14J',
                  inventory: {
                    qty: 5
                  }
                }, {
                  bin: 'A52A'
                }]
              }
            }
          })).toBe(
            'having "stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "w1"."name" = \'Mercury\' and ' +
              '("w1"."description" = \'a bit whiffy\' or (("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = 5) or "warehouse_bins"."bin" = \'A52A\'))'
          );
        });

      });

    });

  });

});
