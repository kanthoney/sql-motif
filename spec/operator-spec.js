'use strict';

const dialect = new (require('../src/dialects').default);
const { operators, fn, verbatim } = require('../index');
const _ = require('lodash');

describe('operator tests', () => {

  describe('basic operators', () => {
    const ops = {
      eq: '=',
      ne: '!=',
      lt: '<',
      gt: '>',
      le: '<=',
      ge: '>='
    };

    const values = [
      'test_value',
      '"hello"',
      "isn\'t",
      null,
      5,
      fn('curdate'),
      '23%',
      '',
      verbatim('test')
    ];

    Object.keys(ops).forEach(op => {
      values.forEach(value => {
        it(`Should create clause for ${ops[op]} operator`, () => {
          let opName = ops[op];
          if(_.isNil(value)) {
            if(op === 'eq') {
              opName = 'is';
            } else if(op === 'ne') {
              opName = 'is not';
            }
          }
          expect(dialect.escape(operators[op](value))).toEqual(`${opName} ${dialect.escape(value)}`);
        });
      });
    });
  });

  describe('in tests', () => {

    const ops = {
      in: 'in',
      notIn: 'not in'
    };

    const values = [
      ['a'],
      'a',
      ['b', 'c', 'd'],
      ['a', fn('sqrt', 2)],
      [verbatim('default')],
      null
    ];

    Object.keys(ops).forEach(k => {
      values.forEach(value => {
        it(`should create a clause for '${ops[k]} with values ${JSON.stringify(value)}`, () => {
          const op = operators[k](value);
          let a = value;
          if(!_.isArray(a)) {
            a = [a];
          }
          expect(dialect.escape(op)).toBe(`${ops[k]} (${a.map(value => dialect.escape(value)).join(', ')})`);
        });
      })
    });

  });

  describe('regexp tests', () => {

    const values = [
      'test',
      '$100',
      'wasn\'t.'
    ];

    values.forEach(value => {
      it(`should produce regexp for values starting with '${value}'`, () => {
        const op = operators.startsWith;
        expect(dialect.escape(op(value))).toBe(`regexp ${dialect.escape('^' + _.escapeRegExp(value))}`);
      });

      it(`should produce regexp for values ending with '${value}'`, () => {
        const op = operators.endsWith;
        expect(dialect.escape(op(value))).toBe(`regexp ${dialect.escape(_.escapeRegExp(value) + '$')}`);
      });

      it(`should produce regexp for values containing '${value}'`, () => {
        const op = operators.contains;
        expect(dialect.escape(op(value))).toBe(`regexp ${dialect.escape('^' + _.escapeRegExp(value) + '$')}`);
      });

      it(`should produce regexp for values not starting with '${value}'`, () => {
        const op = operators.notStartsWith;
        expect(dialect.escape(op(value))).toBe(`not regexp ${dialect.escape('^' + _.escapeRegExp(value))}`);
      });

      it(`should produce regexp for values not ending with '${value}'`, () => {
        const op = operators.notEndsWith;
        expect(dialect.escape(op(value))).toBe(`not regexp ${dialect.escape(_.escapeRegExp(value) + '$')}`);
      });

      it(`should produce regexp for values not containing '${value}'`, () => {
        const op = operators.notContains;
        expect(dialect.escape(op(value))).toBe(`not regexp ${dialect.escape('^' + _.escapeRegExp(value) + '$')}`);
      });

    });

  });

});
