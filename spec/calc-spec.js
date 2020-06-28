'use strict';

const { Table, operators } = require('../index');

describe("calc column tests", () => {

  const table = new Table({
    name: 'calc',
    columns: [
      { name: 'col1', type: 'varchar(255)' },
      { name: 'calc1', calc: ({ table, sql, context }) => sql`ifnull(${table.column('col1')}, ${context.col1 || 0})` }
    ]
  });

  const join = table.join({
    name: 'calc2',
    alias: 'c2',
    table: {
      name: 'calc2',
      columns: [
        { name: 'col2a', type: 'varchar(255)' },
        { name: 'col2b', type: 'varchar(255)' },
        { name: 'calc2', calc: ({ table, sql, context }) => sql`coalesce(${table.selectArray(/col2/)}, ${context.default || 0})` }
      ]
    },
    on: ['col2a:col1']
  });

  it('should select calc1', () => {
    expect(table.select('calc1', { context: { col1: 5 } })).toBe('ifnull("calc"."col1", 5) as "calc1"');
  });

  it('should select calc1 with no context', () => {
    expect(table.select('calc1')).toBe('ifnull("calc"."col1", 0) as "calc1"');
  });

  it('should create select query for calc1', () => {
    expect(table.SelectWhere('calc1', { calc1: operators.ge(({ col, sql, context }) => sql`${col} + ${context.calc1}`) }, { context: { calc1: 5, col1: 6 } } )).toBe(
      'select ifnull("calc"."col1", 6) as "calc1" from "calc" where ifnull("calc"."col1", 6) >= ifnull("calc"."col1", 6) + 5'
    );
  });

  it('should create a where clause', () => {
    expect(table.Where({ col1: ({ col, sql, context }) => sql`${col} + ${context.col1}` }, { context: { col1: 1 } })).toBe(
      'where "calc"."col1" = "calc"."col1" + 1'
    );
  });

  it('should create a where clause', () => {
    expect(table.Where({ col1: [ ({ col, sql, context }) => sql`${col} + ${context.col1}`,
                                 ({ table, col, sql, context }) => sql`${table.column('calc1')} - ${col} + ${context.col1}` ] }, { context: { col1: 1 } }))
      .toBe(
        'where ("calc"."col1" = "calc"."col1" + 1 or "calc"."col1" = ifnull("calc"."col1", 1) - "calc"."col1" + 1)'
      );
  });

  it('should select calc2 column', () => {
    expect(join.Select({ calc2: 'calc2' })).toBe(
      'select coalesce("c2"."col2a", "c2"."col2b", 0) as "calc2_calc2"'
    );
  });

  it('should select calc2 column', () => {
    expect(join.Select({ calc2: 'calc2' }, { context: { default: 'a' } } )).toBe(
      'select coalesce("c2"."col2a", "c2"."col2b", \'a\') as "calc2_calc2"'
    );
  });

  it('should create a where clause involving calc2', () => {
    expect(join.Where({ calc2: { calc2: 'b' } }, { context: { default: 'x' } })).toBe(
      'where coalesce("c2"."col2a", "c2"."col2b", \'x\') = \'b\''
    );
  });

  it('should set col2a with calculated value', () => {
    expect(join.Set({ calc2: { col2a: ({ table, col, context, sql }) => sql`${table.column('col2b')} + ifnull(${col}, ${context.col2a})` } },
                    { context: { col2a: 10 } }))
    .toBe(
      'set "c2"."col2a" = "c2"."col2b" + ifnull("c2"."col2a", 10)'
    );
  });

});
