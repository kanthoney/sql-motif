# From options

The [`table.from`](./table.md#from) takes a single `options` object as an argument which has the following properties:

* `joins`. A list of names of joined tables to include in the `from` clause, or '*' for all joined tables. Defaults to including all tables.

* `context`. The `context` object is a user defined object that is passed as the `context` parameter to any [subquery](./subquery-config.md) tables which use a function
  to generate the subquery.

