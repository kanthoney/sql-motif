'use strict';

const tables = require('./tables')
const joins = require('./joins');
const op = require('../src/operators');

describe('where tests', () => {

  fdescribe('table tests', () => {

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

});
