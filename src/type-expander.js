'use strict';

const _ = require('lodash');
const Column = require('./column');

let debug = false;

class TypeExpander
{
  constructor(types)
  {
    this.types = types || {};
  }

  expand(col)
  {
    const ColumnSet = require('./column-set');
    if(col instanceof Column || col instanceof ColumnSet) {
      return col;
    }
    if(!col.type) {
      return new Column({ ...col, type: 'varchar(255)' });
    }
    if(_.isArray(col.type)) {
      const name = col.name;
      const type = col.type;
      const alias = col.alias || col.name;
      const path = col.path || [alias];
      const table = col.table;
      const selector = col.selector;
      return new ColumnSet({
        columns: type.map(subType => ({
          ...subType,
          ...(_.omit(col, ['type', 'selector'])),
          path: path.concat(subType.alias || subType.name),
          alias: `${alias}_${subType.alias || subType.name}`,
          name: `${name}_${subType.name}`
        })),
        name,
        alias,
        path,
        table,
        selector,
        types: this.types
      });
    }
    if(!this.types[col.type]) {
      return new Column(col);
    }
    const type = this.types[col.type];
    if(_.isArray(type)) {
      return this.expand({
        ...col,
        type
      });
    }
    if(_.isString(type)) {
      return this.expand({ ...col, type });
    }
    return this.expand({
      ...type,
      ...col,
      type: type.type
    })
  }
};

module.exports = TypeExpander;
