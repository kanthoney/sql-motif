# Column selector

The argument passed to a table's `select` methods can be:

* If the argument is undefined or the string `'*'` then all fields are selected.

* A string containing the alias of the column. If the column doesn't have an alias this is checked against the column's name.

* A regular expression to be tested against the columns alias, or name if it has no alias.

* A function. This is passed a column object (which will have the same fields as a [column specification](./column-spec.md) plus a few more) and should return a truthy value
to accept the column.

* A string starting with a period will select columns with a `selector` field containing the selector.

* An array of selectors, in which case any column passing any of the selectors will be included.
