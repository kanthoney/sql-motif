'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('order by tests', () => {

  describe('orders table tests', () => {

    const t = tables.orders;

    it('should create order by clause on order_id field', () => {
      expect(t.OrderBy('order_id')).toBe('order by "s1"."orders"."order_id" asc');
    });

    it('should create order by clause on company and order_id field', () => {
      expect(t.OrderBy(['company', 'order_id'])).toBe('order by "s1"."orders"."company" asc, "s1"."orders"."order_id" asc');
    });

    it('should create order by clause on company descending and order_id field', () => {
      expect(t.OrderBy(['company desc', 'order_id'])).toBe('order by "s1"."orders"."company" desc, "s1"."orders"."order_id" asc');
    });

    it('should create an order by clause with an object as an entry', () => {
      expect(t.OrderBy([ 'order_id desc', { delivery: { name: 'desc', address: { street: 'asc' } } }])).toBe(
        'order by "s1"."orders"."order_id" desc, "s1"."orders"."delivery_name" desc, "s1"."orders"."delivery_address_street" asc'
      );
    });

  });

  describe('inventory join tests', () => {

    const t = joins.inventory;
    
    it('should order by sku then warehouse name', () => {
      expect(t.orderBy(['sku', 'warehouse_name'])).toBe('"stock"."sku" asc, "w1"."name" asc');
    });

    it('should order by sku ascending, then by warehouse object', () => {
      expect(t.orderBy(['sku asc', { warehouse: { name: 'desc' }, bin: { bin: 'asc' } }])).toBe('"stock"."sku" asc, "w1"."name" desc, "warehouse_bins"."bin" asc');
    });

  });

});
