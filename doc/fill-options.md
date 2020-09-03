# Fill options

An object containing options for fill operations. The available options are:

* `context` a user-defined object passed to any `default` functions in the [columns specification](./column-spec.md).

* `selector` A [selector](./selector.md) that selects which columns need filling. If missing fills all columns with a `default` in the [column specification](./column-spec).

* `includeReadOnly`. Set to `true` to fill in subrecords of read only joins.
