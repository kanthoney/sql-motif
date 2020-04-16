# Join specification

The `Table` configuration can take an array of joins specifications in the `joins` parameter. A joined table can also be created by passing a join specification
to the table `join` method.

The join specification object can take the following parameters:

* `table`. The subtable to be joined onto this one. Can be either a `Table` object or a table configuration object.

* `name`. The name of the join. In a record, the fields corresponding to the joined table will appear under this name. Defaults to the name of the joined table.

* `on`. Specifies which columns are joined to which. This takes one of the following formats:

** An object where the keys are the names of the columns of the joined table and the values are the names of the main table.

** A string or an array of strings of the form `'join_column:main_column'`. If `join_column` happens to be the same as `main_column` then you can simply use
`'join_column'`.

** An array of arrays of the form `['join_column', 'main_column']`, or simply `['join_column']` if the two columns have the same name.
