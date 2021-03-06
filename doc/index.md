# `sql-motif`

`sql-motif` is an SQL query builder. It is designed to be able to generate query fragments as well as whole queries so that if the query is too complex for the builder to
cope with the whole thing you can still use it to generate the boilerplate such as select lists and bits of where queries. There is also an included [type system](./types.md)
which allows you to manage complex types automatically.

## Installation

```
npm install --save sql-motif
```

## Usage

```
const motif = require('sql-motif');
```

or

```
const motif = require('sql-motif')(defaults);
```

where `defaults` are default config options (such as types or dialect) passed to the [table configuration](./table.md)

The `motif` object has the following components:

* `Table` A class for managing [tables](./table.md).

* [`Dialect`](./dialect) A class which can be subclassed to provide an alternative dialect.

* `dialects` An object containing a few alternative dialects. Currently includes `default`, `mysql` (if the optional [mysql](https://www.npmjs.com/package/mysql)
package is installed), `sqlite` and `postgres`

* `operators`. A set of [operators](./operators.md) for including in `where` queries.

* `Operator`. The `Operator` class for creating your own [operators](./operators.md).

* [`Fn`](./function). A function for creating SQL functions. The first argument is the name of the SQL function and the rest are passed as arguments, e.g.

```
const { Fn, dialects } = require('sql-motif');

dialects.default.escape(Fn('sqrt', 2)); // 'sqrt(2)'
```

* [`Verbatim`](./verbatim). Used to avoid escaping in queries, e.g.

```
const { Verbatim, dialects } = require('sql-motif');

dialects.default.escape(verbatim('unescaped')); // unescaped
```
* [`Identifier`](./identifier). Used to specify that the item to be escaped is an identifier, e.g.

```
const { Identifier } = require('sql-motif');

orders.where({ order_date: Identifier('delivery_date') }); // "orders"."order_date" = "delivery_date";
```

* `DateOnly`. Used to specify that the value should be interpreted as a date only, not a date time.

```
const { dialects, DateOnly } = require('sql-motif');

dialects.default.escape(new Date); // '2020-04-16 16:58:17'
dialects.default.escape(DateOnly(new Date)); // '2020-04-16'
```

* [`snippet`](./snippet). A symbol used to insert custom subclauses into `where` clauses.

* [`and`](./snippet). Behaves similarly to `snippet`, but if passed an array separates the subclauses using `and` instead of `or`.

## Testing

You can run basic tests as follows:

```
npm run test
```

You can also run a few tests against actual databases using the following steps:

* The following should be installed as dev dependencies

```
npm install mysql
npm install pg
npm install sqlite3
```

* Sqllite uses the `:memory:` database. For others, create a folder `config` in the base directory and create `mysql.json` or `pg.json` configuration files.

* run

```
npm run test-db
```

