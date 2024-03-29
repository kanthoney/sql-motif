'use strict';

const tables = require('./tables');
const joins = require('./joins');
const SafetyError = require('../src/safety-error');

describe('delete tests', () => {

  describe('table tests', () => {

    describe('orders tests', () => {

      const t = tables.orders;

      it('should delete order record', () => {
        const record = {
          company: 'HAD010',
          order_id: 'cfc6b632-cf18-4e98-a8f1-acbec9da6581'
        };
        expect(t.Delete(record)).toBe(
          'delete "s1"."orders" from "s1"."orders" where "s1"."orders"."company" = \'HAD010\' and "s1"."orders"."order_id" = \'cfc6b632-cf18-4e98-a8f1-acbec9da6581\''
        );
      });

      it('should delete order record', () => {
        const record = {
          company: 'HAD010',
          order_id: 'cfc6b632-cf18-4e98-a8f1-acbec9da6581',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          }
        };
        expect(t.Delete(record)).toBe(
          'delete "s1"."orders" from "s1"."orders" where "s1"."orders"."company" = \'HAD010\' and "s1"."orders"."order_id" = \'cfc6b632-cf18-4e98-a8f1-acbec9da6581\''
        );
      });

      it('should delete order record', () => {
        const record = {
          company: 'HAD010',
          order_id: 'cfc6b632-cf18-4e98-a8f1-acbec9da6581',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          }
        };
        expect(t.DeleteWhere(record)).toBe(
          'delete "s1"."orders" from "s1"."orders" where "s1"."orders"."company" = \'HAD010\' and "s1"."orders"."order_id" = \'cfc6b632-cf18-4e98-a8f1-acbec9da6581\' and ' +
            '"s1"."orders"."order_date" = \'2020-04-15 15:56:04\' and "s1"."orders"."customer" = \'PRJ001\' and "s1"."orders"."delivery_name" = \'Terry Test\' and ' +
            '"s1"."orders"."delivery_address_company" = \'\' and "s1"."orders"."delivery_address_street" = \'17 Acacia Ave.\' and ' +
            '"s1"."orders"."delivery_address_locality" = \'Stormford\' and "s1"."orders"."delivery_address_city" = \'Manchester\' and ' +
            '"s1"."orders"."delivery_address_region" = \'\' and "s1"."orders"."delivery_address_postalCode" = \'M9 5DF\' and "s1"."orders"."delivery_address_country" = \'GB\' ' +
            'and "s1"."orders"."billing_name" = \'Bill Smith\' and "s1"."orders"."billing_address_company" = \'Brimstone Ltd\' and ' +
            '"s1"."orders"."billing_address_street" = \'17 Halford Court\' and "s1"."orders"."billing_address_locality" = \'Zenith Business Park\' and ' +
            '"s1"."orders"."billing_address_city" = \'Huddersfield\' and "s1"."orders"."billing_address_region" = \'West Yorkshire\' and ' +
            '"s1"."orders"."billing_address_postalCode" = \'HD12 6HF\' and "s1"."orders"."billing_address_country" = \'GB\''
        );
      });

      it('should delete order record', () => {
        const record = {
          company: 'HAD010',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          }
        };
        expect(t.Delete(record)).toBe(
          'delete "s1"."orders" from "s1"."orders" where "s1"."orders"."company" = \'HAD010\''
        );
      });

      it('should throw when deleting order record', () => {
        const record = {
          company: 'HAD010',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          }
        };
        expect(() => t.DeleteSafe(record)).toThrowError(SafetyError);
      });

    });

  });

  describe("join tests", () => {

    describe("orders tests", () => {

      const j = joins.orders;

      it("Should delete orders", () => {
        const record = {
          company: 'HAD010',
          order_id: 'cfc6b632-cf18-4e98-a8f1-acbec9da6581',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          },
          lines: {
            sku: 'YU787',
            description: 'Box of nails',
            cost: '4.34',
            qty: '20'
          }
        };
        expect(j.Delete(record)).toBe(
          'delete "s1"."orders", "ol1" from "s1"."orders" inner join "order_lines" as "ol1" on "ol1"."company" = "s1"."orders"."company" and "ol1"."order_id" = ' +
          '"s1"."orders"."order_id" where "s1"."orders"."company" = \'HAD010\' and "s1"."orders"."order_id" = \'cfc6b632-cf18-4e98-a8f1-acbec9da6581\''
        );
      });

      it("Should delete order", () => {
        const record = {
          company: 'HAD010',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          },
          lines: {
            sku: 'YU787',
            description: 'Box of nails',
            cost: '4.34',
            qty: '20'
          }
        };
        expect(j.Delete(record)).toBe(
          'delete "s1"."orders", "ol1" from "s1"."orders" inner join "order_lines" as "ol1" on "ol1"."company" = "s1"."orders"."company" and "ol1"."order_id" = ' +
          '"s1"."orders"."order_id" where "s1"."orders"."company" = \'HAD010\''
        );
      });

      it("Should throw attempting to delete order", () => {
        const record = {
          company: 'HAD010',
          customer: 'PRJ001',
          order_date: '2020-04-15 15:56:04',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
              region: '',
              postalCode: 'M9 5DF',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Bill Smith',
            address: {
              company: 'Brimstone Ltd',
              street: '17 Halford Court',
              locality: 'Zenith Business Park',
              city: 'Huddersfield',
              region: 'West Yorkshire',
              postalCode: 'HD12 6HF',
              country: 'GB'
            }
          },
          lines: {
            sku: 'YU787',
            description: 'Box of nails',
            cost: '4.34',
            qty: '20'
          }
        };
        expect(() => j.DeleteSafe(record)).toThrowError(SafetyError);
      });

    });

  });

  describe('order and limit tests', () => {

    const { Table } = require('../index');

    const t = new Table({
      name: 'a',
      columns: [
        { name: 'a', type: 'int', primaryKey: true },
        { name: 'b', type: 'char(20)' }
      ]
    });

    it('should delete last 5 records', () => {
      expect(t.Delete({ b: '' }, { orderBy: 'a desc', limit: 5 })).toBe(
        `delete "a" from "a" where 1 = 1 order by "a"."a" desc limit 5`
      );
    });

    it('should delete records 10-15', () => {
      expect(t.DeleteWhere({ b: '' }, { orderBy: 'a', limit: 5, start: 10 })).toBe(
        `delete "a" from "a" where "a"."b" = '' order by "a"."a" asc limit 10, 5`
      );
    });

  });

});
