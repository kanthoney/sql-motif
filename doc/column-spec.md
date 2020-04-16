# Column specification

 column in a table specification is specified by an object with the following fields:

 * `name`. A string for the name of the SQL field.

 * `alias`. An optional alias to use for the column. If specified, any records processed by `sql-motif` will use this instead of the SQL name.

 * `type`. A string containing an SQL type, or a [type](./types.md) specification

 * `notNull`. `true` if the column must not be null

 * `primaryKey`. `true` if the column is part of the primary key. Can be omitted if the `primaryKey` field is included in the table specification

 * `default`. The default value if none is given.
