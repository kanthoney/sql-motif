# Record

An object for manipulating a record. Has the following methods and properties:

## methods

* `validate([context], [selector])`. Validates the record, setting the `valid` and `errors` properties. `context` is passed to ant functions specified in the [column specifications](./column-spec.md)
that take a context. `selector` is an optional [selector](./selector.md) if you only want to validate certain columns. Returns this record.

* `validateKey([context])`. Validates the primary key fields of the record.

* `validateAsync([context], [selector])`. Validates the record asynchronously, returning a promise that yields to this record.

* `validateKeyAsync([context])`. Validates the primary key fields of the record asynchronously.

* `fill([context], [selector])`. Fills in missing data from the `default` setting in the [column specification](./column-spec.md). `context` is passed to any column specification functions that
take a context. `selector` is an optional [selector](./selector.md) if you only want to fill certain columns. Returns this record.

* `fillAsync([context], [selector])`. Fills in missing data asynchronously, returns a promise yielding to this record.

* `scope(values)`. This is used to enforce values on records. For example, if the user is logged in with company account of `LON001`, running `scope({ company: 'LON001' })` will ensure the record's
`company` field is set to that account.

* `key` Returns an object containing the key fields of the record

* `keyScope(scope)` Returns an object containing the key fields of the record or provided `scope` object, with `scope` taking preference.

* `Insert(options)`. Produces an `insert` statement for this record. `options` is a set of [options](./table-options.md) to pass to the table's `insert` method. Does not include subrecords.

* `insert(options)`. Produces an `insert` statement for this record, excluding the `insert` keyword. `options` is a set of [options](./table-options.md) to pass to the table's `insert` method.
Does not include subrecords.

* `insertValues(options)`. Produces a `values` clause, excluding the `values` keyword, for this record.

* `insertColumns(options)`. Produces a list of columns for inclusion in an `insert` statement.

* `Insert(options)`. Produces an `insert ignore` statement for this record. `options` is a set of [options](./table-options.md) to pass to the table's `insert` method. Does not include subrecords.

* `Update(options)`. Produces an `update` statement for this record.

* `update(options)`. Produces an `update` statement for this record, excluding the `update` keyword.

* `UpdateKey(key, options)`. Produces an `update` statement for this record. `key` contains key fields that are different from the record.

* `updateKey(key, options)`. Produces an `update` statement for this record, excluding the `update` keyword. `key` contains key fields that are different from the record.

* `UpdateWhere(where, options)`. Produces an `update` statement for this record. `where` is used for the `where` clause.

* `updateWhere(where, options)`. Produces an `update` statement for this record, excluding the `update` keyword. `where` is used for the where clause.

* `Delete(options)`. Produces a `delete` statement for this record.

* `delete(options)`. Produces a `delete` statement for this record, excluding the `delete` keyword.

* `reduceSubtables(f, acc)`. Performs a reduction of each of the subtables connected to this record. `f` is called with the parameters `(acc, join, recordSet)` where `acc` is the result
of the last call, `join` is the [join specification](./join-spec.md) associated with this subtable and `recordSet` is the [`RecordSet`](./record-set) containing the subrecords.
Returns the result of the last call.

* `reduceSubtablesAsync(f, acc)`. Preforms a reduction as above where `f` is a function that can return a promise.

* `forEachSubtable(f)`. Calls `f(join, recordSet)` for each subtable of the record, where `join` is the [join specification)](./join-spec.md) for the subtable and `recordSet` is a
[`RecordSet`](./record-set.md) containing the subrecords.

* `mapSubtables(f)`. Calls `f(join, recordSet)` for each subtable, where `join` is the [join specification](./join-spec.md) and `recordSet` is the [`RecordSet`](./record-set.md)
containing the subrecords. Returns an array of results.

* `toObject(options)`. Creates a plain object. `options` has the same format as in [`RecordSet`](./record-set.md).

* `toJSON()`. Creates a plain object with default options, as in [`RecordSet`](./record-set.md).

## Properties

* `valid`. `true` if the record has been validated and is valid, `false` if the record has been validated but is not valid and `undefined` if the record has not been validated.

* `errors`. An object containing any errors
