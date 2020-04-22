# sql-motif

The `sql-motif` package is an sql query generator. It is designed so that it can also generate parts of queries so that, if the generator is unable to create a particular query
then you can still use it to generate the tedious parts such as field lists.

## Installation

```
npm install --save @kanthoney/sql-motif
```

## Documentation

See the [doc](./doc/index.md) folder for documentation

## Example

```
// Specify list types to use (optional). You can create compound types such as addresses which will be expanded to a list of columns in the table.

const types = {
  id: { type: 'char(36)', default: () => uuid.v4() },
  addressLine: { type: 'varchar(40)', notNull: true, default: '' },
  address: {
    type: [
      { name: 'company', type: 'addressLine' },
      { name: 'street', type: 'addressLine' },
      { name: 'locality', type: 'addressLine' },
      { name: 'city', type: 'addressLine' },
      { name: 'region', type: 'addressLine' },
      { name: 'postalCode', type: 'addressLine' },
      { name: 'country', type: 'addressLine' }
    ]
  },
  contact: [
    { name: 'name', type: 'addressLine' },
    { name: 'address', type: 'address' }
  ],
  sku: 'char(25)',
  price: { type: 'decimal(10, 2)', notNull: true }
};

// import the library, specifying defaults.

const motif = require('@kanthoney/sql-motif')({ types, dialect: 'mysql' });

// Set up table specifications

const orders = new motif.Table({
  name: 'orders',
  columns: [
    { name: 'order_id', type: 'id', notNull: true, primaryKey: true },
    { name: 'order_date', type: 'date' },
    { name: 'delivery', type: 'contact' },
    { name: 'invoice', type: 'contact' }
  ]
});

const order_lines = new motif.Table({
  name: 'order_lines',
  columns: [
    { name: 'order_id', type: 'id', notNull: true, primaryKey: true },
    { name: 'line_no', type: 'int', notNull: true, primaryKey: true },
    { name: 'sku', type: 'sku', notNull: true },
    { name: 'description', type: 'text' },
    { name: 'qty', type: 'int', notNull: true },
    { name: 'price', type: 'price' }
  ]
});

// Create a join

const join = orders.join({
  table: order_lines,
  name: 'lines',
  on: 'order_id'
});

// Search database for orders delivered to Terry Test from 2020-04-16

const result = await db.query(join.SelectWhere('*', { order_date: '2020-04-16', { delivery: { name: 'Terry Test' } } }));

// Collate the results and return as JSON.

return JSON.stringify(join.collate(result));
```
