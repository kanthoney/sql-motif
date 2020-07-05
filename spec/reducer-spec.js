'use strict';

const { Table } = require('../index');

describe('reducer tests', () => {

  const stock = new Table({
    name: 'stock',
    columns: [
      { name: 'sku', type: 'varchar(30)', primaryKey: true },
      { name: 'description', type: 'text', primaryKey: true }
    ]
  });
  
  const stock_attributes = new Table({
    name: 'stock_attributes',
    columns: [
      { name: 'sku', type: 'varchar(30)', primaryKey: true },
      { name: 'attr', type: 'varchar(30)', primaryKey: true },
      { name: 'value', type: 'text' }
    ]
  });
  
  const stock_with_attributes = stock.join({
    name: 'attributes',
    table: stock_attributes,
    on: ['sku'],
    reducer: (acc, record) => {
      if(acc === undefined) {
        acc = {};
      }
      acc[record.get('attr')] = record.get('value');
      return acc;
    }
  });

  it('should consolidate lines, applying the reducer to create the attributes subrecord', () => {
    const lines = [
      {
        sku: 'AA143',
        description: 'Gadget',
        attributes_sku: 'AA143',
        attributes_attr: 'length',
        attributes_value: 25
      },
      {
        sku: 'AA143',
        description: 'Gadget',
        attributes_sku: 'AA143',
        attributes_attr: 'width',
        attributes_value: 15
      },
      {
        sku: 'AA143',
        description: 'Gadget',
        attributes_sku: 'AA143',
        attributes_attr: 'height',
        attributes_value: 5
      },
      {
        sku: 'AH627',
        description: 'Hammer',
        attributes_sku: 'AH627',
        attributes_attr: 'length',
        attributes_value: 14
      },
      {
        sku: 'AH627',
        description: 'Hammer',
        attributes_sku: 'AH627',
        attributes_attr: 'width',
        attributes_value: 6
      },
      {
        sku: 'AH627',
        description: 'Hammer',
        attributes_sku: 'AH627',
        attributes_attr: 'height',
        attributes_value: 2
      }
    ];

    expect(JSON.stringify(stock_with_attributes.collate(lines))).toBe(
      '[{"sku":"AA143","description":"Gadget","attributes":{"length":25,"width":15,"height":5}},' +
        '{"sku":"AH627","description":"Hammer","attributes":{"length":14,"width":6,"height":2}}]'
    );
  });

});



