'use strict';

const uuid = require('uuid');

module.exports = {
  sku: { type: 'char(25)', validate: /./, validationError: 'SKU must not be empty' },
  account: 'char(12)',
  bin: 'char(8)',
  id: { type: 'char(36)', validate: /^[\da-fA-f]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}$/, validationError: 'Invalid UUID', default: () => uuid.v4() },
  primaryId: { type: 'id', primaryKey: true, notNull: true },
  addressLine: { type: 'char(35)', notNull: true, default: '', tags: 'addressLine' },
  postalCode: { type: 'char(15)', notNull: true, default: '' },
  country: { type: 'char(2)', notNull: true, default: 'GB', validate: ['GB', 'IE', 'US', 'DE', 'FR'], validationError: 'Invalid country code' },
  address: { type: [
    { name: 'company', type: 'addressLine' },
    { name: 'street', type: 'addressLine', validate: (s, col, context) => (context && context.allowEmptyStreets)?true:s === ''?'Street must not be empty':true },
    { name: 'locality', type: 'addressLine' },
    { name: 'city', type: 'addressLine' },
    { name: 'region', type: 'addressLine' },
    { name: 'postalCode', type: 'postalCode' },
    { name: 'country', type: 'country' }
  ], tags: 'address' },
  contact: [
    { name: 'name', type: 'addressLine', validate: /.+/, validationError: 'Name must not be empty' },
    { name: 'address', type: 'address' }
  ],
  qty: { type: 'int', notNull: true, validate: v => Number.isNaN(parseInt(v))?'Invalid quantity':true },
  price: { type: 'decimal(10, 2)', notNull: true, validate: v => { if(Number.isNaN(parseFloat(v))) { throw 'Invalid price'; } return true; } }
}
