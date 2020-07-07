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

* `context`. A user defined object or function to provide a `context` object for `default` or `validate` functions in the [column specifications](./columnspec.md). If a function,
  it is called for each record in the [record set](./record-set.md) with an object of the form `{ record, context }`, where `record` is the current record and 
  `context` is the context passed to the `fill` or `validate` methods.

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

* <a name="from"></a> `from(options)`. Returns a `from` clause, without the `from` keyword, including the table name and `as` clause along with any `on` clause and
  `join` clauses if the table has joined tables. `options` is a set of [from options](./from-options.md).

* `From(options)`. Returns a `from` clause including the `from` keyword.

* <a name="join"></a>`join(config)`. Produces a new table joined to a second table as specified in the [join `config`](./join-spec.md).

* `extend(config)`. Creates a new table with, for example, extra columns specified in `config`.

* <a name="subquery"></a>`subquery(config)`. Creates a new table as a subquery which references the old table, as specified in the [subquery `config`](./subquery-config.md)

* <a name="view"></a> `view(config)`. Create a new table as a view. `config` is a [view `config`](/.view-config.md) object.

### Column methods.

* `column(alias)`. Finds the column with the given alias. A column object will be returned which will have the same fields as a [column specification](./column-spec).
 To find columns located in a joined table, prefix the alias with the join name and an underscore: `join_alias`.

 `columnName(alias)`. Returns the escaped full name of the column, including the full table name.

### Select methods

* `select([selector, options])`. Produces a field list from the given [selector](./selector.md). Takes an optional [`options`](./table-options) argument.

* `Select([selector, options])`. Produces a select clause, including the `select` keyword, with a field list from the given [selector](./selector.md).

* `selectArray([selector, options])`. Produces an array of columns selected according to the given selector.

* `selectWhere(selector, where)`. Produces a simple `select` query (except for the `select` keyword) for the table for the specified columns and `where` specification.

* `SelectWhere(selector, where)`. Produces a simple `select` statement including the `select` keyword.

* `selectWhereKey(selector, where)`. Produces a simple `select` query (except for the `select` keyword) for the table for the specified columns and the key part of the `where`
specification.

* `SelectWhereKey(selector, where)`. Produces a simple `select` statement including the `select` keyword for the key part of the `where` specification.

* `selectWhereMainKey(selector, where)`. Produces a simple `select` query (except for the `select` keyword) for the table for the specified columns and the key part for the main table
(i.e. excluding joins) of the `where` specification.

* `SelectWhereMainKey(selector, where)`. Produces a simple `select` statement including the `select` keyword for the key part for the main table of the `where` specification.

### Set methods

* `set(record, [options])`. Returns a `set` clause for the given record, excluding the `set` keyword. Takes an optional [`options`](./table-options.md) argument.

* `Set(record, [options])`. Returns a `set` clause for the given record, including the `set` keyword.

* `setNonKey(record, [options])`. Returns a `set` clause including only the non-key parts of `record`.

* `SetNonKey(record, [options])`. Returns a `set` clause, including the `set` keyword, for the non-key parts of the record.

### Where methods

* `where(record, [options])`. Produces a `where` clause for the given record, excluding the `where` keyword. If an array of records is provided, produces a set of clauses for each
record separated by `or`. `record` is a [record](./table-record.md). Takes an optional [`options`](./table-options) argument.

* `Where(record, [options])`. Produces a `where` clause for the given record or records, including the `where` keyword.

* `whereKey(record, [options])`. Produces a `where` clause for the key fields of the record.

* `WhereKey(record, [options])`. Produces a `where` clause for the key fields of the record, including the `where` keyword.

* `whereSafe(record, [options])` (*experimental*). Produces a `where` clause for the key fields of the record. Throws an error if part of the primary key of the main table
or any joined tables that are not read only is missing. Does not currently check subtables to see if the missing key could be obtained from there.

* `WhereSafe(record, [options])` (*experimental*). Produces a `where` clause for the key fields of the record, including the `where` keyword. Throws error if part of primary
 key is missing.

* `whereKeySafe(record, [options])` (*experimental*). Produces a `where` clause for the key fields of the record. Throws error if part of primary key is missing.

* `WhereKeySafe(record, [options])` (*experimental*). Produces a `where` clause for the key fields of the record, including the `where` keyword. Throws error if part of
 primary key is missing.

### Insert methods

* `insertColumns()` Produces a list of columns for an insert clause for the top level table not including joins.

* `insertValues(record)` Produces a list of values for an insert statement from the given record. `record` is a [record](./table-record) or array of records.
If `record` is an array produces a comma separated list of records.

* `insert(record)`. Produces an `insert` statement for the record(s), excluding the `insert into` keywords.

* `Insert(record)`. Produces a full insert statement for the record(s), including the `insert into` phrase.

* `InsertIgnore(record)`. Produces a full insert statement for `insert ignore`. The default dialect produces `insert ignore into...`.

### Update methods

* `update(record, [old, options])`. Produces a full `update` query excluding the `update` keyword. If `old` is specified the key fields from `old` are used in the `where` clause,
otherwise the key fields are taken from the `record`. `record` is a [record](./table-record.md). Takes an optional [`options`](./table-options.md) argument.

* `Update(record, [old, options])`. Produces a full `update` query including the `update` keyword.

* `updateWhere(record, where, [options])`. Produces a full `update` query excluding the `update` keyword. The fields from `where`, including non-key fields,  are used
in the `where` clause. `record` is a [record](./table-record.md). Takes an optional [`options`](./table-options.md) argument.

* `UpdateWhere(record, where, [options])`. Produces a full `update` query including the `update` keyword.

* `updateSafe(record, [old, options])` (*experimental*). Produces an `update` query, throwing an error if any part of the primary key is missing from either the main table or
joined tables not marked as read only. Does not currently detect if the missing key can be obtained from one of the subtables.

* `UpdateSafe(record, [old, options])` (*experimental*). Produces an `update` query, including the `update` keyword, throwing an error if the part of the primary key is missing.

* `updateWhereSafe(record, where, [options])` (*experimental*). Produces an `update` query, throwing an error if any part of the primary key is missing from either the main table or
joined tables not marked as read only. Does not currently detect if the missing key can be obtained from one of the subtables.

* `UpdateWhereSafe(record, where, [options])` (*experimental*). Produces an `update` query, including the `update` keyword, throwing an error if the part of the primary key
  is missing.

### Delete methods

* `delete(record, [options])`. Produces a `delete` statement excluding the `delete` keyword. `record` is a [record](./table-record.md). Takes an optional
  [`options`](./table-options) argument.

* `Delete(record, [options])`. Produces a full `delete` statement including the `delete` keyword.

* `deleteSafe(record, [options])` (*experimental*). Produces a `delete` statement excluding the `delete` keyword. Takes an optional [`options`](./table-options) argument.
  Throws an error if part of the primary key of the main table or a joined table not marked as read only is not detected. Does not currently check subtables to see if the missing
  key can be found there.

* `DeleteSafe(record, [options])` (*experimental*). Produces a full `delete` statement including the `delete` keyword. Throws an error if the primary key is not complete.

### Create methods

* `createColumnsArray()` Produces an array of clauses for the columns for use in a `create` statement. The `primary key` option is not included in the column specification -
  use `createPrimaryKey()` instead.

* `createColumns()` Produces a comma separated list of clauses for the columns for use in a `create` statement.

* `createPrimaryKey()`. Produces a `primary key` clause for use in a `create table` statement.

* `createArray()`. Produces an array of clauses including columns, indexes, foreign keys and the primary key for use in a create statement.

* `create()` Produces a `create` statement for the top level table, excluding the `create table` keywords.

* `Create()` Produces a full `create` statement for the top level table including the `create table` keywords.

* `CreateTemp()` Produces a full `create` statement for creating a temporary table.

* `CreateIfNotExists()` Produces a full `create` statement including an `if not exists` clause.

* `CreateTempIfNotExists()` Produces a full `create` statement for a temporary table if it doesn't exists.

### Group, order and limit

* `groupBy([fields])`. Creates a group by clause without the `group by` keywords. `fields` is an array of column names or aliases. If empty, defaults to the primary
key of the main table.

* `GroupBy([fields])`. Creates a group by clause including the `group by` keywords.

* `orderBy([fields])`. Creates an order by clause excluding the `order by` keywords. `fields` is a list of fields in the form `<field_name> [<dir>]`, where `<dir>`
  is either `asc` or `desc`, or can be omitted to use the default of `asc`.

* `OrderBy([fields])`. Creates on order by clause including the `order by` keywords.

* `limit([start,] count)`. Creates a limit clause without the `limit` keyword.

* `Limit([start,] count)`. Creates a limit clause with the `limit` keyword.

### Validation

* `validate(record, [options])`. Validates a record or array of records, checking the value for each column against the `validate` entry in the
[column specification](./column-spec.md). `options` is an object containing [validation options](./validation-options.md). The function will return a validated
[`RecordSet`](./record-set.md). You can use the `validationResult` method on the record set to turn it into something returnable.

* `validateAsync(record, [options])`. Validates a record or array of records, returning a promise resolving to a validation result object as in the previous method.
 Used if the `validate` function in any of the [column specifications](./column-spec.md) returns a promise.

### Filling

* `fill(record, [options])`. Used to fill missing values in a record or array of records, using the `default` field of the [column specification](./column-spec.md).
`options` is an optional object contining [fill options](./fill-options.md). Returns a record set.

* `fillAsync(record, [options])`. Fills in a record or array of records returning a promise. Used if any `default` functions return a promise.

### SQL result collation

* <a name="collate"></a>`collate(lines, [options])`. Takes a set of lines resulting from an SQL query and collates them, packing subrecords into the appropriate locations
specified in the join spec. `options` is a [collation options](./collation-options.md) object.


