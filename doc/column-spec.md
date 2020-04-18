# Column specification

 column in a table specification is specified by an object with the following fields:

 * `name`. A string for the name of the SQL field.

 * `alias`. An optional alias to use for the column. If specified, any records processed by `sql-motif` will use this instead of the SQL name.

 * `type`. A string containing an SQL type, or a [type](./types.md) specification

 * `notNull`. `true` if the column must not be null

 * `primaryKey`. `true` if the column is part of the primary key. Can be omitted if the `primaryKey` field is included in the table specification

 * `default`. The default value if none is given. If a plain value, this is included in `create` statements. Can also be a function for use with the `table.fill(context)` method. The
 function is called with `(col, context)` arguments, where `col` is the column and `context` is the user-defined object passed to the table's `fill` method.

 * `tags`. A space separated list of tags. Used by the table's select methods to select groups of fields without having to specify all of them.

 * `validate`. This is used to validate the field when `table.validate(context)` is called. It can be a string, a regular expression, a function or an array of validators.
 The function takes the arguments `(value, col, context)`, where `value` is the value to be validated, `col` is the column and `context` is the user-defined object passed to the table's
 `validate` function. If the value is valid the function must return `true`. If the validation fails, the function can return `false` to use the default error message, or throw an error
 or return a string to provide a custom error.

 * `validationError`. A default error message to return if the validation fails. If not specified will use a standard error message
