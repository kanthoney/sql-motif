'use strict';

const tables = require('./tables');

describe('limit tests', () => {

  const t = tables.orders;

  it('should produce limit without offset', () => {
    expect(t.Limit(10)).toBe('limit 10');
  });

  it('should produce limit with offset', () => {
    expect(t.Limit(20, 10)).toBe('limit 20, 10');
  });

  describe('Postgresql tests', () => {

    const { Table } = require('../index')({ dialect: 'postgres' });
    const t = new Table({
      name: 'test'
    });

    it('should produce limit without offset', () => {
      expect(t.Limit(10)).toBe('limit 10');
    });

    it('should produce limit with offset', () => {
      expect(t.Limit(20, 10)).toBe('limit 10 offset 20');
    });

  });

});
