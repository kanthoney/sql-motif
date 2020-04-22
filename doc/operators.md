# Operators

`sql-motif` comes with a set of operators for use in queries.

## Usage

```
const ops = require('@kanthoney/sql-motif').operators;

stock.where({ sku: ops.gt('STE') }); // "stock"."sku" > 'STE'
```

The operators are:

* `eq` Equals. If the value is null produces `'is null'`, otherwise `= value`.

* `ne` Not Equals. If the value is null produces `'is not null'`.

* `lt` Less than.

* `gt` Greater than.

* `le` Less than or equal to

* `ge` Greater than or equal to

* `in` Produces `in` clause. Value should be an array of values.

* `notIn` Produces a `not in` clause.

* `regExp` Produces a regular expression clause.

* `notRegExp` Produces a `not regexp` clause.

* `like` Produces a `like` clause.

* `notLike` Produces a `not like` clause.

* `startsWith` Produces a regular expression clause for values starting with the given string.

* `endsWith` Produces a regular expression clause for values ending with the given string.

* `contains` Produces a regular expression clause for values containing the given string.

* `notStartsWith` Produces a regular expression clause for values not starting with the given string.

* `notEndsWith` Produces a regular expression clause for values not ending with the given string.

* `notContains` Produces a regular expression clause for values not containing the given string.

* `between` Takes two values and produces a `between` clause.

* `notBetween` Takes two values and produces a `not between` clause

## Values

As well as regular values, you can pass a function to the operator. This will be called with the arguments `(col, tag)`, where `col` is the column of the `where` or `set`
clause being processed and `tag` is a template string tag which escapes the template entries. For example:

```
orders.where({ delivery_date: ops.lt((col, sql) => tag`${orders.column(order_date)} + interval 3 day`) }); // "orders"."delivery_date" < "orders"."order_date" + interval 3 day
```

## Operator class

You can produce your own operators by using the `Operators` class. For example, the code for producing a `regExp` above is:

```
const regExp = value => new Operator('regexp', value);
```

The constructor takes the name of the operator as the first argument and the value of the second.

If this isn't enough, you may have to extend the Operator class, overriding the `clause(dialect, [rhs])` function. The first argument is the dialect, and the second is the right hand side (usually a column) if this needs to be output.
