# Validation options

An object containing options for validation. The options are:

* `context` A user defined object that is passed to the `validate` and `default` functions in the [column specification](./column-spec.md)

* `selector` A [selector](./selector.md) which specifies which columns to validate. If missing validates all columns.

* `ignoreMissing` A boolean - if set ignores any columns that are undefined (but not columns that are `null`).

* `ignoreMissingNonKey` A boolean that, if set, ignores any non-key columns that are undefined (but not columns set to `null`).
