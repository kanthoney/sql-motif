# Types

`sql-motif` allows you to create aliases for frequently used types to help with consistency and reduce typing. For example:

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

console.log(orders.Create());

/*
create table "orders" (
  "company" char(8) not null,
  "order_id" char(36) not null,
  "customer" char(8),
  "delivery_contact" char(40) not null default '',
  "delivery_address_company" char(40) not null default '',
  "delivery_address_street" char(40) not null default '',
  "delivery_address_locality" char(40) not null default '',
  "delivery_address_city" char(40) not null default '',
  "delivery_address_region" char(40) not null default '',
  "delivery_address_postcode" char(15) not null default '',
  "delivery_address_country" char(2) not null default 'GB',
  "billing_contact" char(40) not null default '',
  "billing_address_company" char(40) not null default '',
  "billing_address_street" char(40) not null default '',
  "billing_address_locality" char(40) not null default '',
  "billing_address_city" char(40) not null default '',
  "billing_address_region" char(40) not null default '',
  "billing_address_postcode" char(15) not null default '',
  "billing_address_country" char(2) not null default 'GB',
  primary key("company", "order_id")
);

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

The `types` object is an object of the form

```
{
  key: <type specification>...
}
```

where `key` is the alias of the type . The type specification can be:

* A string, which can be an SQL type such as `char(40)` or another alias.

* A column specification containing a type and defaults for any other parameters.

* An array of column specifications, which will be expanded to a set of columns.
