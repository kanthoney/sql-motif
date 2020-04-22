# Record

An object for manipulating a record. Has the following methods and properties:

## methods

* `validate(context)`. Validates the record, setting the `valid` and `errors` properties. `context` is passed to ant functions specified in the [column specifications](./column-spec.md)
that take a context. Returns this record.

* `validateAsync(context)`. Validates the record asynchronously, returning a promise that yields to this record.

* `fill(context)`. Fills in missing data from the `default` setting in the [column specification](./column-spec.md). `context` is passed to any column specification functions that take a context.
Returns this record.

* `fillAsync(context)`. Fills in missing data asynchronously, returns a promise yielding to this record.

* `Insert(options)`. Produces an `insert` statement for this record. `options` is a set of [options](./table-options.md) to pass to the table's `insert` method. Does not include subrecords.

* `Update(options)`. Produces an `update` statement for this record.

* `Delete(options)`. Produces a `delete` statement for this record.

* `reduceSubtables(f, acc)`. Performs a reduction of each of the subtables connected to this record. `f` is called with the parameters `(acc, recordSet)` where `acc` is the result of the last call
and `recordSet` is the [`RecordSet`](./record-set) containing the subrecords. Returns the result of the last call.

* `reduceSubtablesAsync(f, acc)`. Preforms a reduction as above where `f` is a function that can return a promise.

* `toObject(options)`. Creates a plain object. `options` has the same format as in [`RecordSet`](./record-set.md).

* `toJSON()`. Creates a plain object with default options, as in [`RecordSet`](./record-set.md).

## Properties

* `valid`. `true` if the record has been validated and is valid, `false` if the record has been validated but is not valid and `undefined` if the record has not been validated.

* `errors`. An object containing any errors
