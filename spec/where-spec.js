'use strict';

const tables = require('./tables')
const joins = require('./joins');
const op = require('../src/operators');
const motif = require('../index');

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

      it('should select orders before today', () => {
        expect(t.where({ order_date: op.lt(motif.fn('curdate')) })).toBe(
          '"s1"."orders"."order_date" < curdate()'
        );
      });

    });

    describe('order_lines tests', () => {

      const t = tables.order_lines;

      it("should select order lines where order_id = '123' and SKU = 'ADF1001'", () => {
        expect(t.where({ order_id: 123, sku: 'ADF1001' })).toBe(
          '"ol1"."order_id" = \'123\' and "ol1"."sku" = \'ADF1001\''
        );
      });

    });

  });

  describe('join tests', () => {

    describe('order join tests', () => {

      const j = joins.orders;

      it("should select orders where sku = 'JXC001'", () => {
        expect(j.where({ lines: { sku: 'JXC001' } })).toBe(
          '"order_lines"."sku" = \'JXC001\''
        );
      });

      it("should select orders where order date is after 2020-04-01 with sku starting with 'HUT_909'", () => {
        expect(j.where({ order_date: op.gt('2020-04-01'), lines: { sku: op.startsWith('HUT_909') } })).toBe(
          '"s1"."orders"."order_date" > \'2020-04-01\' and "order_lines"."sku" like \'HUT\\_909%\''
        );
      });

      it("should select orders where sku does not contain 'DF%G'", () => {
        expect(j.where({ lines: { sku: op.notContains('DF%G') } })).toBe(
          '"order_lines"."sku" not like \'%DF\\%G%\''
        );
      });

    });

    describe('inventory join tests', () => {

      const j = joins.inventory;

      it("should find inventory where sku = 'DDJ9823' and qty > 0", () => {
        expect(j.where({ sku: 'DDJ9823', inventory: { qty: op.gt(0) } })).toBe(
          '"stock"."sku" = \'DDJ9823\' and "i1"."qty" > \'0\''
        );
      });

      it("should find inventory where bin code begins with A or B and qty = 0", () => {
        expect(j.where({ bin: { bin: op.regExp('^[AB]') }, inventory: { qty: 0 } })).toBe(
          '"warehouse_bins"."bin" regexp \'^[AB]\' and "i1"."qty" = \'0\''
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
            },
            {
              bin: 'A52A'
            }]
          }
        })).toBe(
          '"stock"."company" = \'ACME001\' and "stock"."sku" = \'AFJ010\' and "stock"."description" = \'Spirit level\' and "s1"."warehouse"."name" = \'Mercury\' and ' +
          '(("warehouse_bins"."bin" = \'A14J\' and "inventory"."qty" = \'5\') or "warehouse_bins"."bin" = \'A52A\')'
        );
      });
    });

  });

});
