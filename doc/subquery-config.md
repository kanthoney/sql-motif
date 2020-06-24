# subquery config

The [`table.subquery`](./table.md#subquery) method creates a table as a subquery. For example,

```
  const table = new Table({
    name: 'orders',
    columns: [
      { name: 'company', type: 'varchar(8)', notNull: true, primaryKey: true },
      { name: 'id', type: 'char(36)', notNull: true, primaryKey: true },
      { name: 'customer', type: 'varchar(8)', notNull: true }
    ]
  });

  const subTable = table.subquery({
    selector: '*',
    alias: 'sq1',
    query: ({ table, selector, context }) => `${table.SelectWhere('*')} ${table.OrderBy(['company', 'id'])} ${table.Limit(context.start, context.count)}`
  });

  console.log(subTable.SelectWhere('*', { company: 'ACME01' }, { context: { start: 500, count: 10 } }));

  // select "sq1"."company", "sq1"."id", "sq1"."customer" from ( select "orders"."company", "orders"."id", "orders"."customer" from "orders"
  // order by "orders"."company" asc, "orders"."id" asc limit 500, 10 ) as "sq1" where "sq1"."company" = 'ACME01'
```

The `config` object for the `subquery` method takes the following options:

* `selector`. A [`selector`](./selector.md) specifying which columns of the underlying table(s) should be included in the subquery.

* `alias`. An alias for the subquery. If not specified, defaults to the table name with `_subquery` concatenated to it.

* `query`. The query to use. This can be a string or a function. If a function, this takes an object with the following parameters:

  * `table`. The underlying table

  * `selector`. The selector passed to the `subquery` method.

  * `context`. This is a user defined object passed into the `from` method (or related methods) as the `context` parameter of the [`options`](./table-options.md) object.

If not specified, defaults to a query that selects all columns.

