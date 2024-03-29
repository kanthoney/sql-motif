'use strict';

const tables = require('./tables')
const joins = require('./joins');
const op = require('../src/operators');
const motif = require('../index');
const snippet = require('../src/snippet');
const and = require('../src/and');
const Verbatim = require('../src/verbatim');
const operators = require('../src/operators');

describe('where tests', () => {

  describe('table tests', () => {

    describe('order tests', () => {

      const t = tables.orders;

      it("should select orders where company is 'ACE010'", () => {
        expect(t.where({ company: 'ACE001' })).toBe(
          '"s1"."orders"."company" = \'ACE001\''
        );
      });

      it("should select orders where company is 'ACE010' and customer is 'BXY001'", () => {
        expect(t.where({ company: 'ACE010', customer: 'BXY001' })).toBe(
          '"s1"."orders"."company" = \'ACE010\' and "s1"."orders"."customer" = \'BXY001\''
        );
      });

      it('should select orders using only key fields', () => {
        expect(t.whereKey({ company: 'ACE010', customer: 'BXY001' })).toBe(
          '"s1"."orders"."company" = \'ACE010\''
        );
      });

      it("should select orders from company 'ACE010' after date '2020-04-14'", () => {
        expect(t.where({ company: 'ACE010', order_date: op.ge('2020-04-14') })).toBe(
          '"s1"."orders"."company" = \'ACE010\' and "s1"."orders"."order_date" >= \'2020-04-14\''
        );
      });

      it("should select orders from company 'ACE010' after '2020-04-14' and orders from 'BCX002' before '2020-01-01'", () => {
        expect(t.where([
          { company: 'ACE010', order_date: op.gt('2020-04-14') },
          { company: 'BCX001', order_date: op.lt('2020-01-01') }
        ])).toBe(
          '("s1"."orders"."company" = \'ACE010\' and "s1"."orders"."order_date" > \'2020-04-14\') or ("s1"."orders"."company" = \'BCX001\' and "s1"."orders"."order_date" < \'2020-01-01\')'
        )
      });

      it("should select orders where delivery name is 'Terry Test'", () => {
        expect(t.where({ delivery: { name: 'Terry Test' } })).toBe(
          '"s1"."orders"."delivery_name" = \'Terry Test\''
        );
      });

      it("should select orders where delivery name is 'Terry Test' and invoice country is 'GB'", () => {
        expect(t.where({ delivery: { name: 'Terry Test' }, invoice: { address: { country: 'GB' } } })).toBe(
          '"s1"."orders"."delivery_name" = \'Terry Test\' and "s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it("should select orders where delivery name is 'Terry Test' and invoice country is 'GB' and street is 'St. John's Street'", () => {
        expect(t.where({ delivery: { name: 'Terry Test' }, invoice: { address: { street: "St. John's Street", country: 'GB' } } })).toBe(
          '"s1"."orders"."delivery_name" = \'Terry Test\' and "s1"."orders"."billing_address_street" = \'St. John\'\'s Street\' and "s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it("should select orders where delivery name is 'Barney \"Rubble\" Rimmington' and invoice country is 'GB'", () => {
        expect(t.where({ delivery: { name: 'Barney "Rubble" Rimmington' }, invoice: { address: { country: 'GB' } } })).toBe(
          '"s1"."orders"."delivery_name" = \'Barney "Rubble" Rimmington\' and "s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it('should select orders before today', () => {
        expect(t.where({ order_date: op.lt(motif.Fn('curdate')) })).toBe(
          '"s1"."orders"."order_date" < curdate()'
        );
      });

      it("should select orders where delivery street is '20 Highfield Street' or delivery city is 'Manchester'", () => {
        expect(t.where({ delivery: { address: [ { street: '20 Highfield Street' }, { city: 'Manchester' } ] } })).toBe(
          '("s1"."orders"."delivery_address_street" = \'20 Highfield Street\' or "s1"."orders"."delivery_address_city" = \'Manchester\')'
        );
      });

      it("should select orders where customer is 'KJA001' and delivery street is '20 Highfield Street' or delivery city is 'Manchester'", () => {
        expect(t.where({ customer: 'KJA001', delivery: { address: [ { street: '20 Highfield Street' }, { city: 'Manchester' } ] } })).toBe(
          '"s1"."orders"."customer" = \'KJA001\' and ("s1"."orders"."delivery_address_street" = \'20 Highfield Street\' or "s1"."orders"."delivery_address_city" = \'Manchester\')'
        );
      });

      it('should create a where clause with several records ored together', () => {
        expect(t.where([{ company: 'ACME01', order_id: 49 }, { company: 'WIL002', order_id: 94 }])).toBe(
          '("s1"."orders"."company" = \'ACME01\' and "s1"."orders"."order_id" = 49) or ("s1"."orders"."company" = \'WIL002\' and "s1"."orders"."order_id" = 94)'
        );
      });

      it('should create a where clause with delivery name fields ored together', () => {
        expect(t.where({ company: 'ACME01', delivery: { name: [ 'Alice', 'Bob' ] } })).toBe(
          '"s1"."orders"."company" = \'ACME01\' and ("s1"."orders"."delivery_name" = \'Alice\' or "s1"."orders"."delivery_name" = \'Bob\')'
        );
      });

      it('it should create a where clause with a complex or subclause', () => {
        expect(t.where({ company: 'ACME01', [snippet]: [ { order_id: 5 }, { delivery: { name: 'Alice', address: { street: 'Greenway st.' } } } ] }))
          .toBe(
            '"s1"."orders"."company" = \'ACME01\' and ("s1"."orders"."order_id" = 5 or ("s1"."orders"."delivery_name" = \'Alice\' and ' +
              '"s1"."orders"."delivery_address_street" = \'Greenway st.\'))'
          );
      });

      it('should create a where clause with an and clause and two or subclauses', () => {
        expect(t.where({ [and]: [{ [snippet]: [{ company: 'ACME01' }, { order_id: 5 }] }, { [snippet]: [{ company: 'ACME02' }, { order_id: 16 }] }] })).toBe(
          '(("s1"."orders"."company" = \'ACME01\' or "s1"."orders"."order_id" = 5) and ("s1"."orders"."company" = \'ACME02\' or "s1"."orders"."order_id" = 16))'
        );
      });

      it('it should create a where clause with a complex or subclause', () => {
        expect(t.where({ company: 'ACME01', delivery: { [snippet]: [ { name: 'Alice' },  { address: { street: 'Greenway st.' } } ] } }))
          .toBe(
            '"s1"."orders"."company" = \'ACME01\' and ("s1"."orders"."delivery_name" = \'Alice\' or "s1"."orders"."delivery_address_street" = \'Greenway st.\')'
          );
      });

      it('should create a where clause with a functional and clause', () => {
        expect(t.where({ company: 'ACME01', [and]: [ ({ table, sql }) => sql`ifnull(${table.column('order_id')}, 0) = 0`,
                                                     ({ table, sql }) => sql`ifnull(${table.column('order_date')}, now()) > '2020'` ] })).toBe(
          '"s1"."orders"."company" = \'ACME01\' and (ifnull("s1"."orders"."order_id", 0) = 0 and ifnull("s1"."orders"."order_date", now()) > \'2020\')'
        );
      });

      it('it should create a where clause with a complex and subclause', () => {
        expect(t.where({ company: 'ACME01', delivery: { [and]: [ { name: 'Alice' },  { address: { street: 'Greenway st.' } } ] } }))
          .toBe(
            '"s1"."orders"."company" = \'ACME01\' and ("s1"."orders"."delivery_name" = \'Alice\' and "s1"."orders"."delivery_address_street" = \'Greenway st.\')'
          );
      });

      it('should create a where clause with an or clause with functional and verbatim components', () => {
        expect(t.where({ company: 'ACME01', [snippet]: [({ table, sql }) => sql`ifnull(${table.column('order_id')}, 0) = 0`, Verbatim('now() < \'2020-12-05\'')] })).toBe(
          '"s1"."orders"."company" = \'ACME01\' and (ifnull("s1"."orders"."order_id", 0) = 0 or now() < \'2020-12-05\')'
        );
      });

      it('should create a where clause with an and clause with functional and verbatim components', () => {
        expect(t.where({ company: 'ACME01', [and]: [({ table, sql }) => sql`ifnull(${table.column('order_id')}, 0) = 0`, Verbatim('now() < \'2020-12-05\'')] })).toBe(
          '"s1"."orders"."company" = \'ACME01\' and (ifnull("s1"."orders"."order_id", 0) = 0 and now() < \'2020-12-05\')'
        );
      });

    });

    describe('order_lines tests', () => {

      const t = tables.order_lines;

      it("should select order lines where order_id = '123' and SKU = 'ADF1001'", () => {
        expect(t.where({ order_id: 123, sku: 'ADF1001' })).toBe(
          '"ol1"."order_id" = 123 and "ol1"."sku" = \'ADF1001\''
        );
      });

      it('should select order lines with tax price greater then 4', () => {
        expect(t.where({ tax_price: operators.gt(4) })).toBe('"ol1"."price" * 0.2 > 4');
      });

    });

  });

  describe('join tests', () => {

    describe('order join tests', () => {

      const j = joins.orders;

      it("should select orders where sku = 'JXC001'", () => {
        expect(j.where({ lines: { sku: 'JXC001' } })).toBe(
          '"ol1"."sku" = \'JXC001\''
        );
      });

      it("should select orders where order date is after 2020-04-01 with sku starting with 'HUT_$909'", () => {
        expect(j.where({ order_date: op.gt('2020-04-01'), lines: { sku: op.startsWith('HUT_$909') } })).toBe(
          '"s1"."orders"."order_date" > \'2020-04-01\' and "ol1"."sku" regexp \'^HUT_\\$909\''
        );
      });

      it("should select orders where sku does not contain 'DF^G'", () => {
        expect(j.where({ lines: { sku: op.notContains('DF^G') } })).toBe(
          '"ol1"."sku" not regexp \'DF\\^G\''
        );
      });

    });

    describe('inventory join tests', () => {

      const j = joins.inventory;

      it("should find inventory where sku = 'DDJ9823' and qty > 0", () => {
        expect(j.where({ sku: 'DDJ9823', inventory: { qty: op.gt(0) } })).toBe(
          '"stock"."sku" = \'DDJ9823\' and "i1"."qty" > 0'
        );
      });

      it("should find inventory where bin code begins with A or B and qty = 0", () => {
        expect(j.where({ bin: { bin: op.regExp('^[AB]') }, inventory: { qty: 0 } })).toBe(
          '"warehouse_bins"."bin" regexp \'^[AB]\' and "i1"."qty" = 0'
        );
      });

    });

    describe('inventory2 tests', () => {
      const j = joins.inventory2;

      it("should create where clause for inventory", () => {
        expect(j.where({
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
          '"stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "w1"."name" = \'Mercury\' and ' +
          '(("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = 5) or "warehouse_bins"."bin" = \'A52A\')'
        );
      });

      describe('and/or tests', () => {
        
        it('should produce a where clause with an and subclause', () => {
          expect(j.where({
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
            '"stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "w1"."name" = \'Mercury\' and ' +
              '("w1"."description" = \'a bit whiffy\' and (("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = 5) or "warehouse_bins"."bin" = \'A52A\'))'
          );
        });

        it('should produce a where clause with an or subclause', () => {
          expect(j.where({
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
            '"stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "w1"."name" = \'Mercury\' and ' +
              '("w1"."description" = \'a bit whiffy\' or (("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = 5) or "warehouse_bins"."bin" = \'A52A\'))'
          );
        });

      });

    });

  });

});
