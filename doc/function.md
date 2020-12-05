# Fn

`Fn` is used for SQL functions. The first argument is the name, the remainder are the arguments for the functions. For example:

```
const { Fn } = require('sql-motif');
orders.where({ order_date: Fn('ifnull', orders.column('invoice_date'), Fn('now')) }); // "order_date" = ifnull("invoice_date", now())
```

