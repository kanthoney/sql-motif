'use strict';

const joins = require('./joins');
const tables = require('./tables');

describe('join tests', () => {

  describe('orders tests', () => {

    const j = joins.orders;

    it('should create a join clause', () => {
      expect(j.from()).toBe('"s1"."orders" inner join "order_lines" as "ol1" on "ol1"."company" = "s1"."orders"."company" and "ol1"."order_id" = "s1"."orders"."order_id"');
    });

  });

  describe('inventory tests', () => {
    const j = joins.inventory;

    it('should create a join clause', () => {
      expect(j.from()).toBe(
        '"stock" inner join "s1"."warehouse" as "w1" on "warehouse_bins"."company" = "w1"."company" and "warehouse_bins"."warehouse_name" = "w1"."name" inner join ' +
          '"warehouse_bins" on "i1"."bin" = "warehouse_bins"."bin" left join "inventory" as "i1" on "w1"."company" = "stock"."company" and "i1"."company" = "stock"."company" ' +
          'and "i1"."sku" = "stock"."sku"'
        );
    });

    it('should create a full field list', () => {
      expect(j.select()).toBe(
        '"stock"."company", "stock"."sku", "stock"."description", "w1"."company" as "warehouse_company", "w1"."name" as "warehouse_name", ' +
          '"w1"."description" as "warehouse_description", "w1"."address_company" as "warehouse_address_company", "w1"."address_street" as "warehouse_address_street", ' + 
          '"w1"."address_locality" as "warehouse_address_locality", "w1"."address_city" as "warehouse_address_city", "w1"."address_region" as "warehouse_address_region", ' +
          '"w1"."address_postalCode" as "warehouse_address_postalCode", "w1"."address_country" as "warehouse_address_country", "warehouse_bins"."company" as "bin_company", ' +
          '"warehouse_bins"."warehouse_name" as "bin_warehouse_name", "warehouse_bins"."bin" as "bin_bin", "i1"."company" as "inventory_company", "i1"."sku" as "inventory_sku", ' +
          '"i1"."warehouse_name" as "inventory_warehouse_name", "i1"."bin" as "inventory_bin", "i1"."time" as "inventory_time", "i1"."qty" as "inventory_qty", ' +
          '"i1"."cost" as "inventory_cost"'
      );
    });

  });

  describe('inventory2 tests', () => {

    const j = joins.inventory2;

    it('should create a join clause', () => {
      expect(j.From()).toBe(
        'from "stock" inner join ("s1"."warehouse" as "w1" inner join ("warehouse_bins" inner join "inventory" on "inventory"."company" = "warehouse_bins"."company" and ' +
          '"inventory"."bin" = "warehouse_bins"."bin" and "inventory"."warehouse_name" = "warehouse_bins"."warehouse_name") on "warehouse_bins"."company" = "w1"."company" ' +
          'and "warehouse_bins"."warehouse_name" = "w1"."name") on "w1"."company" = "stock"."company" and "inventory"."sku" = "stock"."sku"'
      );
    });

    it('should create a join clause including values in on clause', () => {
      expect(j.From({ where: { warehouse: { name: 'Mercury', bins: { bin: 'A01A' } } } })).toBe(
        'from "stock" inner join ("s1"."warehouse" as "w1" inner join ("warehouse_bins" inner join "inventory" on "inventory"."company" = "warehouse_bins"."company" and ' +
          '"inventory"."bin" = "warehouse_bins"."bin" and "inventory"."warehouse_name" = "warehouse_bins"."warehouse_name") on "warehouse_bins"."bin" = \'A01A\' and ' +
          '"warehouse_bins"."company" = "w1"."company" and "warehouse_bins"."warehouse_name" = "w1"."name") on "w1"."name" = \'Mercury\' and "w1"."company" = "stock"."company" ' +
          'and "inventory"."sku" = "stock"."sku"'
      );
    });
  });

  describe('joins with fixed values in on clauses', () => {

    const join = tables.stock.join({
      table: tables.warehouse.join({
        table: tables.warehouse_bins.join({
          table: tables.inventory,
          on: ['company', 'bin', 'warehouse_name']
        }),
        name: 'bins',
        on: ['company', 'warehouse_name:name']
      }),
      on: ['company', 'bins_inventory_sku:sku', { bins: { inventory: { sku: 'AA454' } } }]
    });

    it('should create from clause', () => {
      expect(join.From()).toBe(
        'from "stock" inner join ("s1"."warehouse" as "w1" inner join ("warehouse_bins" inner join "inventory" on "inventory"."sku" = \'AA454\' and ' +
          '"inventory"."company" = "warehouse_bins"."company" and "inventory"."bin" = "warehouse_bins"."bin" and "inventory"."warehouse_name" = ' +
          '"warehouse_bins"."warehouse_name") on "warehouse_bins"."company" = "w1"."company" and "warehouse_bins"."warehouse_name" = "w1"."name") on ' +
          '"w1"."company" = "stock"."company" and "inventory"."sku" = "stock"."sku"'
      );
    });

    it('should create from clause, overriding sku', () => {
      expect(join.From({ where: { warehouse: { bins: { inventory: { sku: 'ME430' } } } } })).toBe(
        'from "stock" inner join ("s1"."warehouse" as "w1" inner join ("warehouse_bins" inner join "inventory" on "inventory"."sku" = \'ME430\' and "inventory"."company" = ' +
          '"warehouse_bins"."company" and "inventory"."bin" = "warehouse_bins"."bin" and "inventory"."warehouse_name" = "warehouse_bins"."warehouse_name") on ' +
          '"warehouse_bins"."company" = "w1"."company" and "warehouse_bins"."warehouse_name" = "w1"."name") on "w1"."company" = "stock"."company" and "inventory"."sku" = ' +
          '"stock"."sku"'
      );
    });

  });

});
