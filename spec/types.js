'use strict';

module.exports = {
  sku: 'char(25)',
  account: 'char(12)',
  bin: 'char(8)',
  id: { type: 'char(36)' },
  primaryId: { type: 'id', primaryKey: true, notNull: true },
  addressLine: { type: 'char(35)', notNull: true, default: '', selector: 'addressLine' },
  postalCode: { type: 'char(15)', notNull: true, default: '' },
  country: { type: 'char(2)', notNull: true, default: 'GB' },
  address: { type: [
    { name: 'company', type: 'addressLine' },
    { name: 'street', type: 'addressLine' },
    { name: 'locality', type: 'addressLine' },
    { name: 'city', type: 'addressLine' },
    { name: 'region', type: 'addressLine' },
    { name: 'postalCode', type: 'postalCode' },
    { name: 'country', type: 'country' }
  ], selector: 'address' },
  contact: [
    { name: 'name', type: 'addressLine' },
    { name: 'address', type: 'address' }
  ],
  qty: { type: 'int', notNull: true },
  price: { type: 'decimal(10, 2)', notNull: true }
}
