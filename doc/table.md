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

* `join(config)`. Produces a new table joined to a second table as specified in the [join config](./join-config.md).

### Column methods.

* `column(alias)`. Finds the column with the given alias. A column object will be returned which will have the same fields as a [column specification](./column-spec).
 To find columns located in a joined table, prefix the alias with the join name and an underscore: `join_alias`.

 `columnName(alias)`. Returns the escaped full name of the column, including the full table name.

### Select methods

* `select([selector])`. Produces a field list from the given [selector](./selector.md).

* `Select([selector])`. Produces a select clause, including the `select` keyword, with a field list from the given [selector](./selector.md).
