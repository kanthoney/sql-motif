'use strict';

const joins = require('./joins');

describe('join tests', () => {

  describe('orders tests', () => {

    const j = joins.orders;

    it('should create a join clause', () => {
      expect(j.from()).toBe('"s1"."orders" inner join "order_lines" on "order_lines"."company" = "s1"."orders"."company" and "order_lines"."order_id" = "s1"."orders"."order_id"');
    });

  });

  describe('inventory tests', () => {
    const j = joins.inventory;

    it('should create a join clause', () => {
      expect(j.from()).toBe(
        '"stock" inner join "s1"."warehouse" on "s1"."warehouse"."company" = "stock"."company" inner join "warehouse_bins" on ' +
        '"warehouse_bins"."company" = "s1"."warehouse"."company" and "warehouse_bins"."warehouse_name" = "s1"."warehouse"."name" ' +
        'left join "inventory" as "i1" on "i1"."company" = "stock"."company" and "i1"."sku" = "stock"."sku" and "i1"."bin" = "warehouse_bins"."bin"');
    });

    it('should create a full field list', () => {
      expect(j.select()).toBe(
        '"stock"."company", "stock"."sku", "stock"."description", "s1"."warehouse"."company" as "warehouse_company", "s1"."warehouse"."name" as "warehouse_name", ' +
        '"s1"."warehouse"."description" as "warehouse_description", "s1"."warehouse"."address_company" as "warehouse_address_company", ' +
        '"s1"."warehouse"."address_street" as "warehouse_address_street", "s1"."warehouse"."address_locality" as "warehouse_address_locality", ' +
        '"s1"."warehouse"."address_city" as "warehouse_address_city", "s1"."warehouse"."address_region" as "warehouse_address_region", ' +
        '"s1"."warehouse"."address_postalCode" as "warehouse_address_postalCode", "s1"."warehouse"."address_country" as "warehouse_address_country", ' +
        '"warehouse_bins"."company" as "bin_company", "warehouse_bins"."warehouse_name" as "bin_warehouse_name", "warehouse_bins"."bin" as "bin_bin", ' +
        '"i1"."company" as "inventory_company", "i1"."sku" as "inventory_sku", "i1"."warehouse_name" as "inventory_warehouse_name", "i1"."bin" as "inventory_bin", ' +
        '"i1"."time" as "inventory_time", "i1"."qty" as "inventory_qty", "i1"."cost" as "inventory_cost"'
      );
    });

    it('should create an update statement', () => {
      expect(j.Update({ company: 'ACME01', sku: 'ABC065', description: 'plastic thingy' })).toBe(
        'update "stock" set "stock"."description" = \'plastic thingy\' where "stock"."company" = \'ACME01\' and "stock"."sku" = \'ABC065\''
      );
    });

    it('should create a delete statement', () => {
      expect(j.Delete({ company: 'ACME01', sku: 'ABC065', description: 'item', inventory: { warehouse_name: 'atlas' }}, { joins: 'inventory'})).toBe(
        'delete from "stock" left join "inventory" as "i1" on "i1"."company" = "stock"."company" and "i1"."sku" = "stock"."sku" and "i1"."bin" = "warehouse_bins"."bin" ' +
        'where "stock"."company" = \'ACME01\' and "stock"."sku" = \'ABC065\' and "i1"."warehouse_name" = \'atlas\''
      );
    });

  });

  describe('inventory2 tests', () => {

    const j = joins.inventory2;

    it('should create a join clause', () => {
      expect(j.From()).toBe(
        'from "stock" inner join "s1"."warehouse" on "s1"."warehouse"."company" = "stock"."company" inner join "warehouse_bins" on "warehouse_bins"."company" = "s1"."warehouse"."company" ' +
        'and "warehouse_bins"."warehouse_name" = "s1"."warehouse"."name" inner join "inventory" on "inventory"."company" = "warehouse_bins"."company" and "inventory"."bin" = "warehouse_bins"."bin" ' +
        'and "inventory"."warehouse_name" = "warehouse_bins"."warehouse_name" and "inventory"."sku" = "stock"."sku"'
      );
    });
  });

});
