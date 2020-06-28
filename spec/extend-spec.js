'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('extend tests', () => {

  describe('orders tests', () => {

    const t = tables.orders.extend({
      alias: 'o1',
      columns: [
        { name: 'order_count', calc: ({ table, sql }) => sql`count(distinct ${table.selectArray(['company', 'order_id', 'invoice'])})` }
      ]
    });

    it('should create select statement', () => {
      expect(t.SelectWhere()).toBe(
        'select "o1"."company", "o1"."order_id", "o1"."order_date", "o1"."customer", "o1"."delivery_name", "o1"."delivery_address_company", "o1"."delivery_address_street", ' +
          '"o1"."delivery_address_locality", "o1"."delivery_address_city", "o1"."delivery_address_region", "o1"."delivery_address_postalCode", "o1"."delivery_address_country", ' +
          '"o1"."billing_name" as "invoice_name", "o1"."billing_address_company" as "invoice_address_company", "o1"."billing_address_street" as "invoice_address_street", ' +
          '"o1"."billing_address_locality" as "invoice_address_locality", "o1"."billing_address_city" as "invoice_address_city", ' +
          '"o1"."billing_address_region" as "invoice_address_region", "o1"."billing_address_postalCode" as "invoice_address_postalCode", ' +
          '"o1"."billing_address_country" as "invoice_address_country", count(distinct "o1"."company", "o1"."order_id", "o1"."billing_name", ' +
          '"o1"."billing_address_company", "o1"."billing_address_street", "o1"."billing_address_locality", "o1"."billing_address_city", "o1"."billing_address_region", ' +
          '"o1"."billing_address_postalCode", "o1"."billing_address_country") as "order_count" from "s1"."orders" as "o1"'
      );
    });

  });

});

