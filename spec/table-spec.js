'use strict';

const tables = require('./tables');

describe('table tests', () => {

  describe('orders tests', () => {

    const t = tables.orders;

    it('should return escaped name of table', () => {
      expect(t.name()).toBe('"orders"');
    });

    it('should return the escaped name of the table including schema', () => {
      expect(t.fullName()).toBe('"s1"."orders"');
    });

    it('should return the alias or the full name of the table', () => {
      expect(t.as()).toBe('"s1"."orders"');
    });

    it('should return the full name including as clause if table has an alias', () => {
      expect(t.fullNameAs()).toBe('"s1"."orders"');
    });

    it('should create a field list for select', () => {
      expect(t.select()).toBe(
        '"s1"."orders"."company", "s1"."orders"."order_id", "s1"."orders"."order_date", "s1"."orders"."customer", "s1"."orders"."delivery_name", ' +
        '"s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", "s1"."orders"."delivery_address_city", ' +
        '"s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country", "s1"."orders"."billing_name" as "invoice_name", ' +
        '"s1"."orders"."billing_address_company" as "invoice_address_company", "s1"."orders"."billing_address_street" as "invoice_address_street", ' +
        '"s1"."orders"."billing_address_locality" as "invoice_address_locality", "s1"."orders"."billing_address_city" as "invoice_address_city", ' +
        '"s1"."orders"."billing_address_region" as "invoice_address_region", "s1"."orders"."billing_address_postalCode" as "invoice_address_postalCode", ' +
        '"s1"."orders"."billing_address_country" as "invoice_address_country"'
      );
    });

    it('should create a where clause', () => {
      expect(t.where({ order_id: '123', delivery: { name: 'Terry Test' } })).toBe('"s1"."orders"."order_id" = \'123\' and "s1"."orders"."delivery_name" = \'Terry Test\'');
    });

  });

  describe('order_lines tests', () => {

    const t = tables.order_lines;

    it('should return escaped name of table', () => {
      expect(t.name()).toBe('"order_lines"');
    });

    it('should return the escaped name of the table including schema', () => {
      expect(t.fullName()).toBe('"order_lines"');
    });

    it('should return the alias or the full name of the table', () => {
      expect(t.as()).toBe('"ol1"');
    });

    it('should return the full name including as clause if table has an alias', () => {
      expect(t.fullNameAs()).toBe('"order_lines" as "ol1"');
    });

    it('should create a field list', () => {
      expect(t.select()).toBe('"ol1"."company", "ol1"."order_id", "ol1"."line_no", "ol1"."sku", "ol1"."description", "ol1"."qty", "ol1"."price"');
    });

  });

});
