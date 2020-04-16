'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('create tests', () => {

  describe('orders.tests', () => {

    const t = tables.orders;

    it("should create orders table if it doesn't exist", () => {
      expect(t.CreateIfNotExists()).toBe(
        'create table if not exists "s1"."orders" ("company" char(12) not null, "order_id" char(36) not null, "order_date" date, "customer" char(12), "delivery_name" char(35) not null default \'\', ' +
        '"delivery_address_company" char(35) not null default \'\', "delivery_address_street" char(35) not null default \'\', "delivery_address_locality" char(35) not null default \'\', ' +
        '"delivery_address_city" char(35) not null default \'\', "delivery_address_region" char(35) not null default \'\', "delivery_address_postalCode" char(15) not null default \'\', ' +
        '"delivery_address_country" char(2) not null default \'GB\', "billing_name" char(35) not null default \'\', "billing_address_company" char(35) not null default \'\', ' +
        '"billing_address_street" char(35) not null default \'\', "billing_address_locality" char(35) not null default \'\', "billing_address_city" char(35) not null default \'\', ' +
        '"billing_address_region" char(35) not null default \'\', "billing_address_postalCode" char(15) not null default \'\', "billing_address_country" char(2) not null default \'GB\', ' +
        'primary key("company", "order_id"))'
      );
    });

  });

  describe("order lines tests", () => {

    const t = tables.order_lines;

    it("should create temporary order lines table", () => {
      expect(t.CreateTemp()).toBe(
        'create temporary table "order_lines" ("company" char(12) not null, "order_id" char(36) not null, "line_no" int not null, "sku" char(25), "description" text, ' +
        '"qty" int not null, "price" decimal(10, 2) not null, index "stock_idx"("company", "sku"), index("order_id"), primary key("company", "order_id", "line_no"))'
      );
    });

  });

  describe('inentory tests', () => {

    const t = tables.inventory;

    it('should create inventory table', () => {
      expect(t.Create()).toBe(
        'create table "inventory" ("company" char(12) not null, "sku" char(25) not null, "warehouse_name" char(35) not null default \'\', "bin" char(8) not null, "time" datetime not null, ' +
        '"qty" int not null, "cost" decimal(10, 2) not null, unique index("company", "warehouse_name", "bin"), primary key("company", "sku", "warehouse_name", "time", "bin"))'
      );
    });

  });

});
