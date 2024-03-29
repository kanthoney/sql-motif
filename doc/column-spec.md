# Column specification

 column in a table specification is specified by an object with the following fields:

 * `name`. A string for the name of the SQL field.

 * `alias`. An optional alias to use for the column. If specified, any records processed by `sql-motif` will use this instead of the SQL name.

 * `type`. A string containing an SQL type, or a [type](./types.md) specification

 * `notNull`. `true` if the column must not be null

 * `primaryKey`. `true` if the column is part of the primary key. Can be omitted if the `primaryKey` field is included in the table specification

 * `default`. The default value if none is given. If a plain value, this is included in `create` statements. Can also be a function for use with the
`table.fill(context)` method. The  function is called with an object `{ col, context, sql }`, where `col` is the column, `context` is the user-defined object
passed to the table's `fill` method and `sql` is a template tag for escaping.

 * `context`. An object or function to create or modify the context passed to the `validate` or `fill` table methods. If an object will be used as defaults in case
the context is not supplied. If a function will be called with an object `{ value, context }` where `value` is the current value and `context` is the current context.
The function should return the new context.

 * `tags`. A space separated list of tags. Used by the table's select methods to select groups of fields without having to specify all of them.

 * `validate`. This is used to validate the field when `table.validate(context)` is called. It can be a string, a regular expression, a function or an array of validators.
 The function takes the an object `{ value, col, context }`, where `value` is the value to be validated, `col` is the column and `context` is the user-defined object
passed to the table's `validate` function. If the value is valid the function must return `true`. If the validation fails, the function can return `false` to use the
default error message, or throw an error or return a string to provide a custom error.

 * `validationError`. A default error message to return if the validation fails. If not specified will use a standard error message.

 * `invalidValue`. If set, a validation failure sets the field to this value instead of causing a validation error. If a function is specified, it takes an object
of the form `{ value, col, context, error }` where `value` is the current value, `col` is the column, `context` is the user-defined object passed to the `validate`
function and `error` is the error message from the initial validation. If the function throws, the error message thrown will be used as the validation error. Otherwise,
the field will be set to the return value.

 * `format`. If a function, this will be used to format the output when producing a [record set](./record-set.md). The function takes a single value as an argument

 * `storeAs`. If a function, this will be used to convert the value to a format suitable for storage. The function takes a single value as an argument

 * `calc`. Specifies a calculation column. Can be a string or a function. If a function, is called with a single argument, which is an object with the following properties:

   * `table`. The table the column belongs to

   * `sql`. This is a tag function for escaping template strings. For example, if the `order_count` column was something like:

```
{
  name: 'order_count',
  calc: ({ table, sql }) => sql`count(distinct ${table.selectArray(['company', 'order_id'])})`
}
```

then `select`ing the column would produce something like:

```
select count(distinct "orders"."company", "orders"."order_id") as "order_count"
```

