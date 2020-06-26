# Record

Table methods such as `where` and `set` take a `record` argument. The format of the `record` is described here.

The record is given by an object where each key is the alias of a column (or the name if the column has no alias) and the value is the value of that column. If the
[type](./types.md) of the column is a compound type, i.e. the type was given as an array of column specifications, then the value will itself be an object with the keys
being the names of the subtypes.

## Example

```
const types = {
  order_id: { type: 'char(36)', notNull: true },
  account: 'char(8)',
  addressLine: { type: 'char(40)', notNull: true, default: '' },
  postalCode: { type: 'char(15)', notNull: true, default: '' },
  countryCode: { type: 'char(2)', notNull: true, default: 'GB' },
  address: {
    type: [
      { name: 'company', type: 'addressLine' },
      { name: 'street', type: 'addressLine' },
      { name: 'locality', type: 'addressLine' },
      { name: 'city', type: 'addressLine' },
      { name: 'region', type: 'addressLine' },
      { name: 'postcode', type: 'postalCode' },
      { name: 'country', type: 'countryCode' }
    ]
  },
  contact: [
    { name: 'contact', type: 'addressLine' },
    { name: 'address', type: 'address' }
  ]
}

const orders = new Table({
  name: 'order',
  types,
  columns: [
    { name: 'company', type: 'account', primaryKey: true },
    { name: 'order_id', type: 'order_id', primaryKey: true },
    { name: 'customer', type: 'account' },
    { name: 'delivery', type: 'contact' },
    { name: 'billing', type: 'contact', alias: 'invoice' }
  ]
});

/*
records processed by the table will be expected to be in this format:

{
  company: 'ACME001',
  order_id: '8bd613e7-7fc8-11ea-86e2-0a631ffa2fae',
  customer: 'TTY033',
  delivery: {
    contact: 'Terry Test',
    address: {
      company: '',
      street: '8 Highfield Road',
      locality: '',
      city: 'Birmingham',
      region: 'West Midlands',
      postcode: 'B12 8NG',
      country: 'GB'
    }
  },
  invoice: { // invoice, not billing, because we specified an alias for this column in the table spec
    contact: 'Terry Test',
    address: {
      company: '',
      street: '8 Highfield Road',
      locality: '',
      city: 'Birmingham',
      region: 'West Midlands',
      postcode: 'B12 8NG',
      country: 'GB'
    }
  },
}

*/
```

The values of the record can be plain values such as strings or numbers, or one of the following special options:

* A value of the `Operator` class. This allows you to use operators other than `=` in where clauses. For example:

```
const { operators } = require('sql-motif');

console.log(stock.where({ sku: operators.ge('ACME') })) // "stock"."sku" >= 'ACME'
```

* A value of the Fn class. This allows you to create an SQL function. `sql-motif` comes with a function that allows you to create these. The first argument is the name of the SQL function
and all the others are the values passed to it:

```
const { Fn } = require('sql-motif');

console.log(stock.where({ qty: Fn('greatest', 2, 3, 4) })); // "stock"."qty" = greatest(2, 3, 4)
```

* A value of the `Verbatim` class is passed directly to the SQL query without being escaped or otherwise modified:

```
const { Verbatim } = require('sql-motif');

console.log(stock.where({ sku: Verbatim('unescaped') })); // "stock"."sku" = unescaped
```

* A function of the form `f(column, tag)`. The column is the column of the `where` or `set` clause, and the tag is a template string tag that will escape entries in template strings. For example;

```
console.log(stock.Set({ qty: (col, sql) => sql`${col} + 1` })); // set "stock"."qty" = "stock"."qty" + 1
```
