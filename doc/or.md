# Or subclauses

If you want to create a where clause with several records `or`ed together, you can pass an array to the table `where` method:

````
orders.where([{ company: 'ACME01', order_id: 49 }, { company: 'WIL002', order_id: 94 }]));
// ("orders"."company" = 'ACME01' and "orders"."order_id" = 49) or ("orders"."company" = 'WIL002' and "orders"."order_id" = 94)
````

Likewise, you can pass an array to a given field to create an `or` subclause on that field (you could also use the `in` operator dor that, of course):

````
orders.where({ company: 'ACME01', delivery: { name: [ 'Alice', 'Bob' ] } }));
// "orders"."company" = 'ACME01' and ("orders"."delivery_name" = 'Alice' or "orders"."delivery_name" = 'Bob')
````

It's a bit tricky to create an `or` clause anywhere in the middle layers of the where clause. To help you out, there's an `or` symbol which you can use. If `sql-motif`
comes across a record which has this symbol as a key, it `or`s those subrecords together and inserts them into the query at that point. For example:

````
const { or } = require('sql-motif');
orders.where({ company: 'ACME01', [or]: [ { order_id: 5 }, { delivery: { name: 'Alice', address: { street: 'Greenway st.' } } } ] }));

// "orders"."company" = 'ACME01' and ("orders"."order_id" = 5 or ("orders"."delivery_name" = 'Alice' and "orders"."delivery_address_street" = 'Greenway st.'))
````

