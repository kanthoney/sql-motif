# Collation options

The `options` argument in [table.collate](./table.md#collate) method is an object with the following available options:

* `collate`. A [selector](./selector.md) specifying which fields to collate on. Defaults to the primary key.

* `json`. If true, indicates that the `table.collate` method should produce a plain object and not a [record set](./record-set.md)

* `reducer`. A function which customises the output when the result is converted to an object via `toObject` or `toJSON`. The function
  takes arguments of the form `(acc, record)` and is called for each record of the output. `acc` is initially `reduceInit`, and the returned value
  of each invocation is passed as the `acc` to the next invocation. The final `acc` is the end result of the operation.

* `reduceInit`. An initial value for the `reducer` function. If a function, is called with no arguments to produce an initial value.

* `noReducer`. If set to `true` does not call any reducers and instead return arrays.

* `noMerge`. By default, if records are found with the same primary key they are merged into the same record. Set `noMerge` to `true` to keep them separate.

