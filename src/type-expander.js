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
      return new Column({ partName: col.alias || col.name, ...col });
    }
    if(_.isArray(col.type)) {
      const name = col.name;
      const type = col.type;
      const alias = col.alias || col.name;
      const partName = col.partName || alias;
      const path = col.path || [alias];
      const table = col.table;
      const tags = col.tags;
      return new ColumnSet({
        columns: type.map(subType => this.expand({
            ...subType,
            ...(_.omit(col, ['type', 'tags', 'context'])),
          path: path.concat(subType.alias || subType.name),
          alias: `${alias}_${subType.alias || subType.name}`,
          name: `${name}_${subType.name}`,
          partName: subType.alias || subType.name,
          table,
          tags
        })),
        partName,
        name,
        alias,
        path,
        table,
        tags
      });
    }
    if(!this.types[col.type]) {
      return new Column({
        partName: col.alias || col.name,
        ...col
      });
    }
    const type = this.types[col.type];
    if(_.isArray(type)) {
      return this.expand({
        ...col,
        type
      });
    }
    if(_.isString(type)) {
      return this.expand({ partName: col.alias || col.name, ...col, type });
    }
    return this.expand({
      ...type,
      partName: col.alias || col.name,
      ...col,
      tags: (col.tags || '').split(/\s+/g).concat((type.tags || '').split(/\s+/g)).join(' '),
      type: type.type
    })
  }
};

module.exports = TypeExpander;
