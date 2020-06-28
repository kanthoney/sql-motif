# Options

Some table query generation methods take an optional `options` argument to adjust the way the query is processes. This is an object with the following keys:

* `joins`. This is an array of the names of joined tables to include in the query. It can also be the string `'*'` to specify all joined tables. If omitted all joined tables
are included.

* `safe` (*experimental*). If set to `true`, in a query involving a `where` clause, throw an error if any of the primary key fields of the top level table or any non-read-only
joined tables is missing. Marked as experimental as it does not currently detect the situation where the key is in a joined subtable column.

* `brackets`. For a `where` clause, enclose the clause in brackets if there are more than one subclauses.

* `selector`. Include a (selector)[./selector.md] to select columns.

* `context`. A user supplied object passed to functions such as those specified in `calc` [columns](column-spec.md), `where` clauses and subqueries.

 