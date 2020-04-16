# `sql-motif`

`sql-motif` is an SQL query builder. It is designed to be able to generate query fragments as well as whole queries so that if the query is too complex for the builder to cope with the whole thing
you can still use it to generate the boilerplate such as select lists and bits of where queries. There is also an included [type system](./types.md) which allows you to manage complex types
automatically.

## Installation

```
npm install --save @kanthoney/sql-motif
```

## Usage

```
const motif = require('@kanthoney/sql-motif');
```

or

```
const motif = require('@kanthoney/sql-motif')(defaults);
```

where `defaults` are default config options (such as types or dialect) passed to the [table configuration](./table.md)

The `motif` object has the following components:

* `Table` A class for managing [tables](./table.md).

* [`Dialect`](./dialect) A class which can be subclassed to provide an alternative dialect.

* `dialects` An object containing a few alternative dialects. Currently includes `default` and `mysql` (if the optional [mysql](https://www.npmjs.com/package/mysql) package is installed).

* `operators`. A set of [operators](./operators.md) for including in `where` queries.

* `fn`. A function for creating SQL functions. The first argument is the name of the SQL function and the rest are passed as arguments, e.g.

```
const { fn, dialects } = require('@kanthoney/sql-motif');

dialects.default.escape(fn('sqrt', 2)); // 'sqrt(2)`
```

* `verbatim`. Used to avoid escaping in queries, e.g.

```
const { verbatim, dialects } = require('@kanthoney/sql-motif');

dialects.default.escape(verbatim('unescaped')); // unescaped
```
