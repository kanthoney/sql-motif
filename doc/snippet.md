# Snippets

Suppose you want to insert a custom subclause into a `where` clause. Something like:

```
`company` = 'ACME01' and ifnull(`order_date`, now()) < ifnull(`invoice_date`, now())
```

You can insert such specially formatted snippets using the `snippet` symbol. When `sql-motif` finds this symbol as a key in a record, it inserts the corresponding
value directly into the `where` clause. For example, to produce the above query, you can use: 

```
const { snippet, Verbatim } = require('sql-motif');

orders.where({ company: 'ACME01', [snippet]: Verbatim(ifnull(`order_date`, now()) < ifnull(`invoice_date`, now())) });
```

Here, we've used `Verbatim` to put hand-coded SQL directly in place. A more sophisticated technique is to use a function. This takes an object of the form
`{ table, record, sql, context }`, where `table` is the table, `record` is the record, `sql` is a template for escaping values and `context` is the user-defined
object passed to the `where` method (via the `options` argument):

```
const { snippet } = require('sql-motif');

orders.where({ company: 'ACME01', [snippet]: ({ table, sql }) => sql`ifnull(${table.column('order_date')}, now()) < ifnull(${table.column('invoice_date')}, now())` });
```

You can also pass in a plain object or an array of items. For an array of items, the subclauses will normally be separated by `or`, which is the normal result when
you pass an array to `where`. To use `and` instead, there is a similar `and` symbol:

```
const { Verbatim, snippet, and } = require('sql-motif');

orders.where({ company: 'ACME01', [and]: [ Verbatim('now() > \'2020-01-01\''), { order_date: '2020-12-05' } ] });
// `company` = 'ACME01' and (now() > '2020-01-01' and `order_date` = '2020-12-05')

orders.where({ company: 'ACME01', [snippet]: [ Verbatim('now() > \'2020-01-01\''), { order_date: '2020-12-05' } ] });
// `company` = 'ACME01' and (now() > '2020-01-01' or `order_date` = '2020-12-05')
```

