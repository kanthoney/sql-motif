# Tables

The `Table` object is used to generate table-based queries.

## Usage

```
const stock = new Table({
  name: 'stock',
  columns: [
    { name: 'sku', type: 'char(50)', notNull: true, primaryKey: true },
    { name: 'description', type: 'text', notNull: true, default: '' }
  ]
});

console.log(stock.where({ sku: 'ADF934', description: 'Hammer' }));
/*
"stock"."sku" = 'ADF934' and "stock"."description" = 'Hammer'
*/
```

## Configuration

The constructor takes a configuration object with the following fields:

* `name`. A string containing the name of the table.

* `alias`. An optional string containing the table alias

* `schema`. An optional string for the database schema the table belongs to.

* `columns`. An array of [column specifications](./columns-spec.md).

* `primaryKey`. An array of column names that constitute the primary key. As an alternative, you can use the `primaryKey` flag in each of the columns if those are in the right order.

* `dialect`. An SQL dialect to use. Can be a string such as `mysql` or a Dialect object. If omitted uses the default dialect.

* `joins`. An optional array of join specifications.

## Methods

As a general rule, SQL generating methods starting with a capital letter produce keywords whereas those starting with a lower case letter don't. For example:

```
stock.select(); // "stock"."sku", "stock"."description"
stock.Select(); // select "stock"."sku", "stock"."description"
```

### General methods

* `escape(value)`. Escapes and quotes the given value.

* `escapeId(id)`. Escapes and quotes the given identifier.

### Table methods

* `name()`. Returns the escaped name of the table. The unescaped name can be obtained from `table.config.name`.

* `fullName()`. Returns the full name of the table including schema if specified.

* `as()`. Returns the table alias or the full name including schema if no alias was specified

* `fullNameAs()`. Returns the full name of the table with `as` clause if an alias was specified

* `on()`. Returns an `on` clause (without the `on` keyword) if this table is part of a join. Returns an empty string if the table is not part of a join.

* `On()`. Returns an `on` clause including the `on` keyword. Returns an empty string if not part of a join.

* `from()`. Returns a `from` clause, without the `from` keyword, including the table name and `as` clause along with any `on` clause and `join` clauses if the table has joined tables.

* `From()`. Returns a `from` clause including the `from` keyword.

* `join(config)`. Produces a new table joined to a second table as specified in the [join `config`](./join-spec.md).

### Column methods.

* `column(alias)`. Finds the column with the given alias. A column object will be returned which will have the same fields as a [column specification](./column-spec).
 To find columns located in a joined table, prefix the alias with the join name and an underscore: `join_alias`.

 `columnName(alias)`. Returns the escaped full name of the column, including the full table name.

### Select methods

* `select([selector, options])`. Produces a field list from the given [selector](./selector.md). Takes an optional [`options`](./table-options) argument.

* `Select([selector, options])`. Produces a select clause, including the `select` keyword, with a field list from the given [selector](./selector.md).

### Set methods

* `set(record, [options])`. Returns a `set` clause for the given record, excluding the `set` keyword. Takes an optional [`options`](./table-options.md) argument.

* `Set(record, [options])`. Returns a `set` clause for the given record, including the `set` keyword.

* `setNonKey(record, [options])`. Returns a `set` clause including only the non-key parts of `record`.

* `SetNonKey(record, [options])`. Returns a `set` clause, including the `set` keyword, for the non-key parts of the record.

### Where methods

* `where(record, [options])`. Produces a `where` clause for the given record, excluding the `where` keyword. If an array of records is provided, produces a set of clauses for each record
separated by `or`. Takes an optional [`options`](./table-options) argument.

* `Where(record, [options])`. Produces a `where` clause for the given record or records, including the `where` keyword.

* `whereKey(record, [options])`. Produces a `where` clause for the key fields of the record.

* `WhereKey(record, [options])`. Produces a `where` clause for the key fields of the record, including the `where` keyword.

### Insert methods

* `insertColumns()` Produces a list of columns for an insert clause for the top level table not including joins.

* `insertValues(record)` Produces a list of values for an insert statement from the given record. If `record` is an array produces a comma separated list of records.

* `insert(record)`. Produces an `insert` statement for the record(s), excluding the `insert into` keywords.

* `Insert(record)`. Produces a full insert statement for the record(s), including the `insert into` phrase.

* `InsertIgnore(record)`. Produces a full insert statement for `insert ignore`. The default dialect produces `insert ignore into...`.

### Update methods

* `update(record, [old, options])`. Produces a full `update` query excluding the `update` keyword. If `old` is specified the key fields from `old` are used in the `where` clause, otherwise
the key fields are taken from the `record`. Takes an optional [`options`](./table-options.md) argument.

* `Update(record, [old, options])`. Produces a full `update` query including the `update` keyword.

### Delete methods

* `delete(record, [options])`. Produces a `delete` statement excluding the `delete` keyword. Takes an optional [`options`](./table-options) argument.

* `Delete(record, [options])`. Produces a full `delete` statement including the `delete` keyword.

### Create methods

* `createColumnsArray()` Produces an array of clauses for the columns for use in a `create` statement. The `primary key` option is not included in the column specification - use `createPrimaryKey()`
instead.

* `createColumns()` Produces a comma separated list of clauses for the columns for use in a `create` statement.

* `createPrimaryKey()`. Produces a `primary key` clause for use in a `create table` statement.

* `create()` Produces a `create` statement for the top level table, excluding the `create table` keywords.

* `Create()` Produces a full `create` statement for the top level table including the `create table` keywords.

* `CreateTemp()` Produces a full `create` statement for creating a temporary table.

* `CreateIfNotExists()` Produces a full `create` statement including an `if not exists` clause.

* `CreateTempIfNotExists()` Produces a full `create` statement for a temporary table if it doesn't exists.
