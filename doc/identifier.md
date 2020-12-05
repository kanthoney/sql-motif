# Identifier

`Identifier` is used to tell the escaper to use identifier escapes. For example:

```
const { Identifier } = require('sql-motif');
orders.where({ order_date: Identifier('invoice_date') }); // "order_date" = "invoice_date"
```
