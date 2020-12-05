# Verbatim

`Verbatim` is used to disable escaping. For example:

```
const { Verbatim } = require('sql-motif');
orders.where({ order_date: Verbatim('curdate()') }); // "order_date" = curdate()
```

