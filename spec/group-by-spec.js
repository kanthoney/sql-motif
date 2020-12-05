'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('group by tests', () => {
  
  describe('orders table tests', () => {

    const t = tables.orders;

    it('should group by company, order_id', () => {
      expect(t.GroupBy(['company', 'order_id'])).toBe('group by "s1"."orders"."company", "s1"."orders"."order_id"');
    });

    it('should group by company, delivery name using selector object', () => {
      expect(t.GroupBy({ company: true, delivery: ['name'] })).toBe('group by "s1"."orders"."company", "s1"."orders"."delivery_name"');
    });

  });

  describe('inventory joins tests', () => {
    
    const t = joins.inventory;

    it('should group by company, warehouse name', () => {
      expect(t.groupBy({ company: true, warehouse: { name: true } })).toBe('"stock"."company", "w1"."name"');
    });

  });

});
