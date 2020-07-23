'use strict';

const tables = require('./tables');
const joins = require('./joins');
const SafetyError = require('../src/safety-error');

describe('update tests', () => {

  describe('tables', () => {

    describe('orders table', () => {

      const t = tables.orders;

      it('should update full record', () => {
        const record = {
          company: 'AA565',
          order_id: 'dea1734e-1af1-4508-966c-709fcc18fa5c',
          order_date: '2020-04-12',
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
        expect(t.Update(record)).toBe(
          'update "s1"."orders" set "s1"."orders"."order_date" = \'2020-04-12\', "s1"."orders"."delivery_name" = \'Terry Test\', "s1"."orders"."delivery_address_company" = \'\', ' +
          '"s1"."orders"."delivery_address_street" = \'17 Acacia Ave.\', "s1"."orders"."delivery_address_locality" = \'Stormford\', "s1"."orders"."delivery_address_city" = \'Manchester\', ' +
          '"s1"."orders"."delivery_address_region" = \'\', "s1"."orders"."delivery_address_postalCode" = \'M9 5DF\', "s1"."orders"."delivery_address_country" = \'GB\', ' +
          '"s1"."orders"."billing_name" = \'Bill Smith\', "s1"."orders"."billing_address_company" = \'Brimstone Ltd\', "s1"."orders"."billing_address_street" = \'17 Halford Court\', ' +
          '"s1"."orders"."billing_address_locality" = \'Zenith Business Park\', "s1"."orders"."billing_address_city" = \'Huddersfield\', "s1"."orders"."billing_address_region" = \'West Yorkshire\', ' +
          '"s1"."orders"."billing_address_postalCode" = \'HD12 6HF\', "s1"."orders"."billing_address_country" = \'GB\' where "s1"."orders"."company" = \'AA565\' and ' +
          '"s1"."orders"."order_id" = \'dea1734e-1af1-4508-966c-709fcc18fa5c\''
        );
      });

      it('should update partial record', () => {
        const record = {
          company: 'AA565',
          order_id: 'dea1734e-1af1-4508-966c-709fcc18fa5c',
          order_date: '2020-04-12',
          delivery: {
            name: 'Terry Test',
            address: {
              street: '17 Acacia Ave.',
              locality: 'Stormford',
              city: 'Manchester',
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
        expect(t.Update(record)).toBe(
          'update "s1"."orders" set "s1"."orders"."order_date" = \'2020-04-12\', "s1"."orders"."delivery_name" = \'Terry Test\', "s1"."orders"."delivery_address_street" = \'17 Acacia Ave.\', ' +
          '"s1"."orders"."delivery_address_locality" = \'Stormford\', "s1"."orders"."delivery_address_city" = \'Manchester\', "s1"."orders"."delivery_address_postalCode" = \'M9 5DF\', ' +
          '"s1"."orders"."delivery_address_country" = \'GB\', "s1"."orders"."billing_name" = \'Bill Smith\', "s1"."orders"."billing_address_company" = \'Brimstone Ltd\', ' +
          '"s1"."orders"."billing_address_street" = \'17 Halford Court\', "s1"."orders"."billing_address_locality" = \'Zenith Business Park\', "s1"."orders"."billing_address_city" = \'Huddersfield\', ' +
          '"s1"."orders"."billing_address_region" = \'West Yorkshire\', "s1"."orders"."billing_address_postalCode" = \'HD12 6HF\', "s1"."orders"."billing_address_country" = \'GB\' ' +
          'where "s1"."orders"."company" = \'AA565\' and "s1"."orders"."order_id" = \'dea1734e-1af1-4508-966c-709fcc18fa5c\''
        );
      });

      it('should throw on attempting to safely update record with missing order_id ', () => {
        const record = {
          company: 'AA565',
          order_date: '2020-04-12',
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
        expect(() => t.UpdateSafe(record)).toThrowError(SafetyError);
      });

      it('should update a record with a given where object', () => {
        const record = {
          company: 'AA565',
          order_id: 'dea1734e-1af1-4508-966c-709fcc18fa5c',
          order_date: '2020-04-12',
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
        expect(t.UpdateWhere(record, { invoice: { name: 'Gloria Spencer' } })).toBe(
          'update "s1"."orders" set "s1"."orders"."company" = \'AA565\', "s1"."orders"."order_id" = \'dea1734e-1af1-4508-966c-709fcc18fa5c\', ' +
            '"s1"."orders"."order_date" = \'2020-04-12\', "s1"."orders"."delivery_name" = \'Terry Test\', "s1"."orders"."delivery_address_company" = \'\', ' +
            '"s1"."orders"."delivery_address_street" = \'17 Acacia Ave.\', "s1"."orders"."delivery_address_locality" = \'Stormford\', ' +
            '"s1"."orders"."delivery_address_city" = \'Manchester\', "s1"."orders"."delivery_address_region" = \'\', "s1"."orders"."delivery_address_postalCode" = \'M9 5DF\', ' +
            '"s1"."orders"."delivery_address_country" = \'GB\', "s1"."orders"."billing_name" = \'Bill Smith\', "s1"."orders"."billing_address_company" = \'Brimstone Ltd\', ' +
            '"s1"."orders"."billing_address_street" = \'17 Halford Court\', "s1"."orders"."billing_address_locality" = \'Zenith Business Park\', ' +
            '"s1"."orders"."billing_address_city" = \'Huddersfield\', "s1"."orders"."billing_address_region" = \'West Yorkshire\', ' +
            '"s1"."orders"."billing_address_postalCode" = \'HD12 6HF\', "s1"."orders"."billing_address_country" = \'GB\' where "s1"."orders"."billing_name" = \'Gloria Spencer\''
        );
      });

    });

  });

  describe("joins", () => {

    describe("orders", () => {

      const j = joins.orders;

      it("should update full record", () => {
        const record = {
          company: 'AA565',
          order_id: 'dea1734e-1af1-4508-966c-709fcc18fa5c',
          order_date: '2020-04-12',
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
            line_no: '1',
            sku: 'AA595',
            description: 'Hammer',
            qty: 5,
            price: 7.98
          }
        };
        expect(j.UpdateSafe(record, null, { joins: '*' })).toBe(
          'update "s1"."orders" inner join "order_lines" as "ol1" on "ol1"."company" = "s1"."orders"."company" and "ol1"."order_id" = "s1"."orders"."order_id" ' +
            'set "s1"."orders"."order_date" = \'2020-04-12\', "s1"."orders"."delivery_name" = \'Terry Test\', "s1"."orders"."delivery_address_company" = \'\', ' +
            '"s1"."orders"."delivery_address_street" = \'17 Acacia Ave.\', "s1"."orders"."delivery_address_locality" = \'Stormford\', ' +
            '"s1"."orders"."delivery_address_city" = \'Manchester\', "s1"."orders"."delivery_address_region" = \'\', "s1"."orders"."delivery_address_postalCode" = \'M9 5DF\', ' +
            '"s1"."orders"."delivery_address_country" = \'GB\', "s1"."orders"."billing_name" = \'Bill Smith\', "s1"."orders"."billing_address_company" = \'Brimstone Ltd\', ' +
            '"s1"."orders"."billing_address_street" = \'17 Halford Court\', "s1"."orders"."billing_address_locality" = \'Zenith Business Park\', ' +
            '"s1"."orders"."billing_address_city" = \'Huddersfield\', "s1"."orders"."billing_address_region" = \'West Yorkshire\', ' +
            '"s1"."orders"."billing_address_postalCode" = \'HD12 6HF\', "s1"."orders"."billing_address_country" = \'GB\', "ol1"."sku" = \'AA595\', ' +
            '"ol1"."description" = \'Hammer\', "ol1"."qty" = 5, "ol1"."price" = 7.98 where "s1"."orders"."company" = \'AA565\' and ' +
            '"s1"."orders"."order_id" = \'dea1734e-1af1-4508-966c-709fcc18fa5c\' and "ol1"."line_no" = \'1\''
        );
      });

      it("should fail update on missing line no", () => {
        const record = {
          company: 'AA565',
          order_id: 'dea1734e-1af1-4508-966c-709fcc18fa5c',
          order_date: '2020-04-12',
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
            sku: 'AA595',
            description: 'Hammer',
            qty: 5,
            price: 7.98
          }
        };
        expect(() => j.UpdateSafe(record)).toThrowError(SafetyError);
      });

    });

    describe("inventory3 tests", () => {

      const j = joins.inventory3;

      it('should produce update', () => {

        const record = {
          company: 'AXA001',
          bin: 'AA12D',
          sku: 'GL898',
          qty: 5,
          time: '2020-03-12 15:39:54',
          cost: '9.80',
          warehouse_name: 'Atlas',
          bins: {
            warehouse: {
              name: 'Atlas'
            }
          },
          stock: {
            sku: 'GL898',
            description: 'Hammer'
          }
        };
        expect(j.UpdateSafe(record)).toBe(
          'update "inventory" inner join ("warehouse_bins" as "b1" inner join "s1"."warehouse" as "w1" on "w1"."company" = "b1"."company" and "w1"."name" = ' +
            '"b1"."warehouse_name") on "b1"."company" = "inventory"."company" and "b1"."warehouse_name" = "inventory"."warehouse_name" and "b1"."bin" = "inventory"."bin" ' +
            'inner join "stock" as "sk1" on "sk1"."company" = "inventory"."company" and "sk1"."sku" = "inventory"."sku" set "inventory"."qty" = 5, ' +
            '"inventory"."cost" = \'9.80\' where "inventory"."company" = \'AXA001\' and "inventory"."sku" = \'GL898\' and "inventory"."warehouse_name" = \'Atlas\' and ' +
            '"inventory"."bin" = \'AA12D\' and "inventory"."time" = \'2020-03-12 15:39:54\' and "w1"."name" = \'Atlas\' and "sk1"."sku" = \'GL898\''
        );

      });

    });

  });

});

