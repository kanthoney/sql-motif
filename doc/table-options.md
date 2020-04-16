# Options

Some table query generation methods take an optional `options` argument to adjust the way the query is processes. This is an object with the following keys:

* `joins`. This is an array of the names of joined tables to include in the query. It can also be the string `'*'` to specify all joined tables. If omitted all joined tables are included.

* `safe`. If set to `true`, in a query involving a `where` clause, throw an error if any of the primary key fields of the top level table (not including joined tables) is missing.

* `fullSafe`. If set to `true`, in a query involving a `where` clause throw an error if any of the primary key fields are missing, including those o joined tables.

* `brackets`. For a `where` clause, enclose the clause in brackets if there are more than one subclauses.

* `selector`. Include a (selector)[./selector.md] to select columns.
