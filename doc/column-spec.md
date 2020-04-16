# Column specification

 column in a table specification is specified by an object with the following fields:

 * `type`. A string containing an SQL type, or a [type](./types.md) specification

 * `notNull`. `true` if the column must not be null

 * `primaryKey`. `true` if the column is part of the primary key. Can be omitted if the `primaryKey` field is included in the table specification

 * `default`. The default value if none is given.
