'use strict';

const validatePostcode = (val, context) => {
  context = context || {};
  if(context.contry_code === 'GB') {
    return /^[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}$/i.test(val) || 'Invalid UK Postcode';
  }
  return true;
}

const fillId = context => {
  try {
    if(context.dns) {
      return `dns-${uuid.v5(context.dns, uuid.v5.DNS)}`;
    } else if(context.url) {
      return `url-${uuid.v5(context.url, uuid.v5.URL)}`;
    }
    return `v4-${uuid.v4()}`;
  } catch(error) {
    return `v4-${uuid.v4()}`;
  }
}

const types = {
  id: { type: 'char(40)', notNull: true, default: fillId },
  account: 'char(6)',
  addressLine: { type: 'char(30)', notNull: true, default: '' },
  postalCode: { type: 'char(12)', notNull: true, validate: validatePostcode },
  country: [
    {
      name: 'code',
      type: 'char(2)',
      notNull: true,
      default: (col, context) => {
        try {
          return context.country || 'GB';
        } catch(error) {
          return 'GB';
        }
      }
    },
    { name: 'name', type: 'addressLine' }
  ],
  address: {
    context: (value, context) => {
      try {
        return { ...context, country_code: value.country.code };
      } catch(error) {
        return context;
      }
    },
    type: [
      { name: 'company', type: 'addressLine' },
      { name: 'street', type: 'addressLine' },
      { name: 'locality', type: 'addressLine' },
      { name: 'city', type: 'addressLine' },
      { name: 'region', type: 'addressLine' },
      { name: 'postalCode', type: 'postalCode' },
      { name: 'country', type: 'country' }
    ]
  },
  contact: [
    { name: 'name', type: 'addressLine' },
    { name: 'address', type: 'address' }
  ],
  sku: 'char(25)',
  qty: { type: 'int', validate: val => !Number.isNaN(parseInt(val)) },
  price: { type: 'decimal(10, 2)', validate: val => !Number.isNaN(parseFloat(val)) }
};

const { Table } = require('../index')({ types });
const uuid = require('uuid');

describe('context tests', () => {

  const tables = {};

  tables.orders = new Table({
    name: 'orders',
    columns: [
      { name: 'company', type: 'account' },
      { name: 'order_id', type: 'id' },
      { name: 'customer', type: 'account' },
      { name: 'order_date', type: 'date' },
      { name: 'delivery', type: 'contact' },
      { name: 'invoice', type: 'contact' }
    ],
    primaryKey: ['company', 'order_id'],
    context: { country: 'GB' }
  });

  tables.order_lines = new Table({
    name: 'order_lines',
    columns: [
      { name: 'company', type: 'account' },
      { name: 'order_id', type: 'id', default: null },
      {
        name: 'line_no',
        type: 'int',
        notNull: true,
        default: context => {
          try {
            return context.line_no++;
          } catch(error) {
            return null;
          }
        }
      },
      { name: 'sku', type: 'sku', notNull: true },
      { name: 'description', type: 'text', notNull: true, default: '' },
      { name: 'qty', type: 'qty' },
      { name: 'price', type: 'price' }
    ],
    context: (records, context) => {
      try {
        return { ...context, line_no: records.reduce((acc, record) => Math.max((record.get('line_no') || 0) + 1, acc), 1) }
      } catch(error) {
        return context;
      }
    }
  });

  const joins = {};

  joins.orders = tables.orders.join({
    name: 'lines',
    table: tables.order_lines,
    on: ['company', 'order_id']
  });

  const records = require('./context-records.json');

  it('should fill records with v4 uuid', () => {
    const filled = joins.orders.fill(records);
    expect(filled.reduce((acc, record) => {
      const id = record.get('order_id');
      if(!/^v4-/.test(id)) {
        return false;
      }
      return record.get('lines').reduce((acc, line) => {
        if(line.get('order_id') !== id) {
          return false;
        }
        return acc;
      }, acc);
    }, true)).toBe(true);
  });

  it('should fill records with v4 uuid asynchronously', done => {
    joins.orders.fillAsync(records).then(filled => {
      expect(filled.reduce((acc, record) => {
        const id = record.get('order_id');
        if(!/^v4-/.test(id)) {
          return false;
        }
        return record.get('lines').reduce((acc, line) => {
          if(line.get('order_id') !== id) {
            return false;
          }
          return acc;
        }, acc);
      }, true)).toBe(true);
    }).catch(fail).finally(done);
  });

});
