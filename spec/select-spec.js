'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('select tests', () => {

  describe('table tests', () => {

    describe('orders tests', () => {

      const t = tables.orders;

      it('should create a list of all fields', () => {
        expect(t.select()).toBe(
          '"s1"."orders"."company", "s1"."orders"."order_id", "s1"."orders"."order_date", "s1"."orders"."customer", "s1"."orders"."delivery_name", "s1"."orders"."delivery_address_company", ' +
          '"s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", "s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", ' +
          '"s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country", "s1"."orders"."billing_name" as "invoice_name", ' +
          '"s1"."orders"."billing_address_company" as "invoice_address_company", "s1"."orders"."billing_address_street" as "invoice_address_street", ' +
          '"s1"."orders"."billing_address_locality" as "invoice_address_locality", "s1"."orders"."billing_address_city" as "invoice_address_city", ' +
          '"s1"."orders"."billing_address_region" as "invoice_address_region", "s1"."orders"."billing_address_postalCode" as "invoice_address_postalCode", ' +
          '"s1"."orders"."billing_address_country" as "invoice_address_country"'
        );
      });

      it('should create a list of delivery contact fields', () => {
        expect(t.select('delivery')).toBe(
          '"s1"."orders"."delivery_name", "s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", ' +
          '"s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country"'
        );
      });

      it('should create a list of invoice address fields', () => {
        expect(t.select('invoice_address')).toBe(
          '"s1"."orders"."billing_address_company" as "invoice_address_company", "s1"."orders"."billing_address_street" as "invoice_address_street", ' +
          '"s1"."orders"."billing_address_locality" as "invoice_address_locality", "s1"."orders"."billing_address_city" as "invoice_address_city", ' +
          '"s1"."orders"."billing_address_region" as "invoice_address_region", "s1"."orders"."billing_address_postalCode" as "invoice_address_postalCode", ' +
          '"s1"."orders"."billing_address_country" as "invoice_address_country"'
        );
      });

      it('should create a list of fields with the addressLine selector', () => {
        expect(t.select('.addressLine')).toBe(
          '"s1"."orders"."delivery_name", "s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", ' +
          '"s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", "s1"."orders"."billing_name" as "invoice_name", ' +
          '"s1"."orders"."billing_address_company" as "invoice_address_company", "s1"."orders"."billing_address_street" as "invoice_address_street", ' +
          '"s1"."orders"."billing_address_locality" as "invoice_address_locality", "s1"."orders"."billing_address_city" as "invoice_address_city", ' +
          '"s1"."orders"."billing_address_region" as "invoice_address_region"'
        );
      });

      it('should create a list of fields from company and delivery address', () => {
        expect(t.select(['company', 'delivery_address'])).toBe(
          '"s1"."orders"."company", "s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", ' +
          '"s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country"'
        );
      });

    });

    describe('order line tests', () => {

      const t = tables.order_lines;

      it('should create a list of all fields', () => {
        expect(t.select()).toBe(
          '"ol1"."company", "ol1"."order_id", "ol1"."line_no", "ol1"."sku", "ol1"."description", "ol1"."qty", "ol1"."price"'
        );
      });

      it('should create a list of primary key fields', () => {
        expect(t.select(col => col.primaryKey)).toBe('"ol1"."company", "ol1"."order_id", "ol1"."line_no"');
      });

    });

    describe('stock table tests', () => {

      const t = tables.stock;

      it('should create a list of all fields', () => {
        expect(t.select()).toBe('"stock"."company", "stock"."sku", "stock"."description"');
      });

    });

  });

  describe('join tests', () => {

    describe('orders tests', () => {

      const j = joins.orders;

      it('should create a list of all fields', () => {
        expect(j.select()).toBe(
          '"s1"."orders"."company", "s1"."orders"."order_id", "s1"."orders"."order_date", "s1"."orders"."customer", "s1"."orders"."delivery_name", ' +
          '"s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", ' +
          '"s1"."orders"."delivery_address_city", "s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", ' +
          '"s1"."orders"."delivery_address_country", "s1"."orders"."billing_name" as "invoice_name", "s1"."orders"."billing_address_company" as "invoice_address_company", ' +
          '"s1"."orders"."billing_address_street" as "invoice_address_street", "s1"."orders"."billing_address_locality" as "invoice_address_locality", ' +
          '"s1"."orders"."billing_address_city" as "invoice_address_city", "s1"."orders"."billing_address_region" as "invoice_address_region", ' +
          '"s1"."orders"."billing_address_postalCode" as "invoice_address_postalCode", "s1"."orders"."billing_address_country" as "invoice_address_country", ' +
          '"order_lines"."company" as "lines_company", "order_lines"."order_id" as "lines_order_id", "order_lines"."line_no" as "lines_line_no", "order_lines"."sku" as "lines_sku", ' +
          '"order_lines"."description" as "lines_description", "order_lines"."qty" as "lines_qty", "order_lines"."price" as "lines_price"'
        );
      });

      it('should create a list of order_lines fields', () => {
        expect(j.select('@order_lines')).toBe(
          '"order_lines"."company" as "lines_company", "order_lines"."order_id" as "lines_order_id", "order_lines"."line_no" as "lines_line_no", ' +
          '"order_lines"."sku" as "lines_sku", "order_lines"."description" as "lines_description", "order_lines"."qty" as "lines_qty", "order_lines"."price" as "lines_price"'
        );
      });

      it('should create a list of address fields and order_line fields', () => {
        expect(j.select(['.address', '@order_lines'])).toBe(
          '"s1"."orders"."delivery_address_company", "s1"."orders"."delivery_address_street", "s1"."orders"."delivery_address_locality", "s1"."orders"."delivery_address_city", ' +
          '"s1"."orders"."delivery_address_region", "s1"."orders"."delivery_address_postalCode", "s1"."orders"."delivery_address_country", ' +
          '"s1"."orders"."billing_address_company" as "invoice_address_company", "s1"."orders"."billing_address_street" as "invoice_address_street", ' +
          '"s1"."orders"."billing_address_locality" as "invoice_address_locality", "s1"."orders"."billing_address_city" as "invoice_address_city", ' +
          '"s1"."orders"."billing_address_region" as "invoice_address_region", "s1"."orders"."billing_address_postalCode" as "invoice_address_postalCode", ' +
          '"s1"."orders"."billing_address_country" as "invoice_address_country", "order_lines"."company" as "lines_company", "order_lines"."order_id" as "lines_order_id", ' +
          '"order_lines"."line_no" as "lines_line_no", "order_lines"."sku" as "lines_sku", "order_lines"."description" as "lines_description", "order_lines"."qty" as "lines_qty", ' +
          '"order_lines"."price" as "lines_price"'
        );
      });

    });

    describe("inventory2 tests", () => {

      const j = joins.inventory2;

      it('Should produce a list of all fields', () => {
        expect(j.select()).toBe(
          '"stock"."company", "stock"."sku", "stock"."description", "s1"."warehouse"."company" as "warehouse_company", "s1"."warehouse"."name" as "warehouse_name", ' +
          '"s1"."warehouse"."description" as "warehouse_description", "s1"."warehouse"."address_company" as "warehouse_address_company", "s1"."warehouse"."address_street" as ' +
          '"warehouse_address_street", "s1"."warehouse"."address_locality" as "warehouse_address_locality", "s1"."warehouse"."address_city" as "warehouse_address_city", ' +
          '"s1"."warehouse"."address_region" as "warehouse_address_region", "s1"."warehouse"."address_postalCode" as "warehouse_address_postalCode", ' +
          '"s1"."warehouse"."address_country" as "warehouse_address_country", "warehouse_bins"."company" as "warehouse_bins_company", "warehouse_bins"."warehouse_name" as ' +
          '"warehouse_bins_warehouse_name", "warehouse_bins"."bin" as "warehouse_bins_bin", "inventory"."company" as "warehouse_bins_inventory_company", ' +
          '"inventory"."sku" as "warehouse_bins_inventory_sku", "inventory"."warehouse_name" as "warehouse_bins_inventory_warehouse_name", "inventory"."bin" as "warehouse_bins_inventory_bin", ' +
          '"inventory"."time" as "warehouse_bins_inventory_time", "inventory"."qty" as "warehouse_bins_inventory_qty", "inventory"."cost" as "warehouse_bins_inventory_cost"'
        );
      });

    });

  });

});
