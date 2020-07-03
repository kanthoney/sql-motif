# View config

The [`table.view`](./table.md#view) method creates a table as a view. For example,

```
  const table = new Table({
    name: 'orders',
    columns: [
      { name: 'company', type: 'varchar(8)', notNull: true, primaryKey: true },
      { name: 'id', type: 'char(36)', notNull: true, primaryKey: true },
      { name: 'customer', type: 'varchar(8)', notNull: true }
    ]
  });

  const view = table.view({
    name: 'customers',
    selector: ['company', 'customer'],
    query: ({ table, selector }) => `select distinct ${table.selectWhere(selector)}`
  });

  console.log(view.Create());

  // create view "customers" as select distinct "orders"."company", "orders"."customer" from "orders"

  console.log(view.SelectWhere());

  // select "customers"."company", "customers"."customer" from "customers"

```

The `config` object for the `subquery` method takes the following options:

* `name`. The name of the view. Defaults to the name of the table with `_view` concatenated.

* `schema`. The schema in which to create the view. If not specified, defaults to the same schema as the undelying table.

* `selector`. A [`selector`](./selector.md) specifying which columns of the underlying table(s) should be included in the view.

* `query`. The query to use. This can be a string or a function. If a function, this takes an object with the following parameters:

  * `table`. The underlying table

  * `selector`. The selector passed to the `view` method.

If not specified, defaults to a query that selects all columns.

