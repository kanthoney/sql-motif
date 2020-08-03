# References specification

The `references` option in the [table](./table.md) configuration is an object or array of objects with the following options, which specify the foreign keys of the table.

* `table`. The foreign table for the key. Can be the name of a table or a [table](./table.md) object.

* `columns`. A string or an array of strings specifying the columns of the table. If the columns of the two tables have different names, they are separated by a colon, e.g.
`'company:account'`, where the left name corresponds to this table and the right the foreign table.

* `onDelete`. An optional string for an `on delete` clause, e.g. `cascade`.

* `onUpdate`. An optional string for an `on update` clause, e.g. `restrict`.

