# RecordSet

A `RecordSet` is an object returned by the `table.toRecordSet`, `table.fill`, `table.validate` and `table.collate` methods. It contains various methods for manipulating set of records:

## Methods

* `addSQLResult(line)`. Adds a line or array of lines from an SQL result to the record set.

* `addRecord(record)`. Adds a record to the record set.

* `validate([options])`. Validates the record set, setting the `valid` property and the `errors` and `valid` properties on each record. Returns the modified record set.
`options` is an optional [validation options](./validation-options.md) object.

* `validateKey([options])`. Validates the primary key fields of the record set.

* `validateAsync([options])`. Validates the record set, returning a promise. Used if any [column specifications](./column-spec.md) have a `validate` setting which is a function that returns a promise.

* `validateKeyAsync([options])`. Validates the primary key fields of the record set asynchronously.

* `validationResult()`. Converts a validated record set to a plain object with the following format:

```
{ result: <Array of results>, valid: true | false }
```

Each result in the array of results has the following format:

```
{ record: <record>, valid: true | false, errors: <error object> }
```

The `errors` field is an object with the same format as the record filled in with any errors.

* `fill([options])`. Fills in any missing fields in the records from the `default` setting in the [column specifications](/column-spec.md).  `options` is a optional
[fill options](./fill-options.md) object.

* `fillAsync([options])`. Fills in missing fields from the records. Used if the [column specification](./column-spec.md) functions return a promise.

* `reduce(f, acc)`. Calls function `f` for each record of the set in turn with the arguments `(acc, record)`. The `acc` parameter is the result of the previous call, or the `acc`
parameter of the `reduce` call for the first record. Returns the result of the final call. `record` is a [`Record`](./record.md) object.

* `map(f)`. Calls `f(record)` for each record in the record set, returning an array of results.

* `filter(f)`. Creates a new `RecordSet` including only those records for which `f(record)` is truthy.

* `forEach(f)`. Calls `f(record)` for each record in the set.

* `reduceAsync(f, acc)`. Performs a reduction as above, but for functions that return a promise. The calls are made sequentially.

* `slice([begin [,end]])`. Creates a record set containing a slice of records from this one.

* `scope(values)`. This will force the values specified in `values` to be applied to each record is the set. For example, if the user is logged in with a company account of `LON001` then
`scope({ company: 'LON001' })` will ensure the records' `company` fields are all set to `LON001`.

* `Insert(options)`. Creates a set of `insert` statements to insert the records, including (by default) any subrecords where the corresponding [join](./join-spec.md) is not set as read-only.
`options` is a set of [options](./table-options.md) to pass to the table's `insert` methods.

* `insert(options)`. Creates a set of `insert` statements to insert the records, excluding the `insert` keyword, including (by default) any subrecords where the corresponding
[join](./join-spec.md) is not set as read-only. `options` is a set of [options](./table-options.md) to pass to the table's `insert` methods.

* `InsertIgnore(options)`. Creates a set of `insert ignore` statements.

* `Update(options)`. Creates a set of `update` statements to update any non-read-only records and subrecords.

* `Update(options)`. Creates a set of `update` statements, excluding the `update` keyword, to update any non-read-only records and subrecords.

* `Delete(options)`. Creates a set of `delete` statements to delete the records including (by default) any non-read-only subrecords.

* `delete(options)`. Creates a set of `delete` statements, excluding the `delete` keyword, to delete the records including (by default) any non-read-only subrecords.

* `toObject(options)`. Creates a plain object. `options` can have the following settings:

  * `noSubRecords` Set to `true` to exclude subrecords from the output.

  * `includeJoined`. Set to `true` to include fields in subtables that are part of the join.

  * `mapJoined`. If `true`, fields in subtables that are part of the join will be filled in from the main table if they are missing.

* `toJSON()`. Converts to a plain object by calling the above method with `includeJoined` and `mapJoined` set to true.

## Properties

* `valid`. Will be `true` if all the records in the record set are valid, `false` if any are invalid and `undefined` if no validation has been run.

* `length`. The number of records in the record set
