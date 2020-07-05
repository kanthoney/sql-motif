# Join specification

The `Table` configuration can take an array of joins specifications in the `joins` parameter. A joined table can also be created by passing a join specification
to the table [`join`](./table.md#join) method.

The join specification object can take the following parameters:

* `table`. The subtable to be joined onto this one. Can be either a `Table` object or a table configuration object.

* `name`. The name of the join. In a record, the fields corresponding to the joined table will appear under this name. Defaults to the name of the joined table.

* `alias`. A new alias for the table.

* `on`. Specifies which columns are joined to which. This takes one of the following formats:

  * A string or an array of strings of the form `'join_column:main_column'`. If `join_column` happens to be the same as `main_column` then you can simply use
  `'join_column'`. The column names are created by concatenating the column path together with underscores, e.g. the `street` field in the `address` object of the
  `warehouse` subtable will have a column name of `warehouse_address_street`.

  * An array of arrays of the form `['join_column', 'main_column']`, or simply `['join_column']` if the two columns have the same name.

  * An object. This is used to specify values (instead of other fields) in the on clause, e.g. { sku: 'AF657' } will include the condition `"sku" = 'AF657'` in the on clause.

* `readOnly`. Set to `true` to exclude table from data changing queries.

* `single`. Set to `true` if the join is expected to yield a single subrecord. If there is indeed a single subrecord it is attached as an object instead of an array.
 If there is no subrecord it is omitted entirely from the record, and if there is more than one subrecord they are attached as an array as normal.

* `context`. A user defined object or function to provide a context for `default` and `validate` functions in [column specifications](./column-spec.md). If a function,
 this is called for each parent record and takes an object of the form `{ record, recordSet, context }` where `record` is the parent record, `recordSet` is the
 [record set](./record-set.md) containing the set of subrecords for this join, and `context` is the context object passed to the `fill` or `validate` [table](./table.md)
 methods.

* `reducer`. A function used to convert the [record set](./record-set.md) of subrecords into an arbitrary value when the top-level record set is converted to a plain object
  via the `toObject` or `toJSON` methods. The function takes the arguments `(acc, record)` where `acc` is initially `undefined` and `record` is a [record](./record.md) from
  the joined subrecords. The function is called for each record and returns the `acc` to be passed to the next invocation. The result is the final `acc` returned.

Example:

```
const stock = new Table({
  name: 'stock',
  columns: [
    { name: 'sku', type: 'varchar(30)', primaryKey: true },
    { name: 'description', type: 'text' }
  ]
});

const stock_attributes = new Table({
  name: 'stock_attributes',
  columns: [
    { name: 'sku', type: 'varchar(30)', primaryKey: true },
    { name: 'key_id', type: 'varchar(30)', primaryKey: true },
    { name: 'value', type: 'text' }
  ]
});

const stock_with_attributes = stock.join({
  name: 'attributes',
  table: stock_attributes,
  on: 'sku',
  reducer: (acc, record) => {
    if(acc === undefined) {
      acc = {};
    }
    acc[record.get('key_id')] = record.get('value');
    return acc;
  }
});

const result = await db.query(stock_with_attributes.SelectWhere());
const collated = stock_with_attributes.collate(result).toJSON();

// The attributes fields in the collated array will be objects with the appropriate key/values, not an array of objects with sku/key_id/value properties.

```

