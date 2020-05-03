'use strict';

const dialects = require('../src/dialects');
const Identifier = require('../src/identifier');
const Verbatim = require('../src/verbatim');
const DateOnly = require('../src/dateonly');
const Fn = require('../src/function');
const moment = require('moment');
const tables = require('./tables');

describe('escape tests', () => {

  describe('default dialect', () => {

    const d = dialects.default;

    it('should escape a plain string', () => {
      expect(d.escape('a')).toBe('\'a\'');
    });

    it('should escape an integer', () => {
      expect(d.escape(8)).toBe('8');
    });

    it('should escape a plain string with quotes', () => {
      expect(d.escape('a\'\"[]$%_`\\')).toBe('\'a\'\'\"[]$%_`\\\'');
    });

    it('should escape an id', () => {
      expect(d.escapeId('a')  ).toBe('"a"');
      expect(d.escape(Identifier('a'))).toBe('"a"');
    });

    it('should escape an id with quotes', () => {
      expect(d.escapeId('\'\"`a')  ).toBe('"\'""`a"');
      expect(d.escape(Identifier('\'\"`a'))).toBe('"\'""`a"');
    });

    it('should escape a date', () => {
      expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01 00:00:00\'');
    });

    it('should escape a date with time', () => {
      expect(d.escape(new Date(2020, 3, 1, 14, 56, 13))).toBe('\'2020-04-01 14:56:13\'');
    });

    it('should escape a moment', () => {
      expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01 00:00:00\'');
    });

    it('should escape a moment with time', () => {
      expect(d.escape(moment('2020-04-01 18:07:34'))).toBe('\'2020-04-01 18:07:34\'');
    });

    it('should escape a dateonly given by a Date', () => {
      expect(d.escape(DateOnly(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01\'');
    });

    it('should escape a dateonly given by a moment', () => {
      expect(d.escape(DateOnly(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01\'');
    });

    it('should escape a dateonly given by a string', () => {
      expect(d.escape(DateOnly('2020-04-01 13:07:14'))).toBe('\'2020-04-01\'');
    });

    it('should not escape a verbatim clause', () => {
      expect(d.escape(Verbatim('\'"`%_ \''))).toBe('\'"`%_ \'')
    });

    it('should escape a function', () => {
      expect(d.escape(Fn('test_func', 5, 8))).toBe('test_func(5, 8)');
    });

    it('should escape a column', () => {
      const t = tables.orders;
      expect(d.escape(t.column('order_id'))).toBe('"s1"."orders"."order_id"');
    });

    it('should escape a function with column as parameter', () => {
      const t = tables.orders;
      expect(d.escape(Fn('ifnull', t.column('order_id'), '6a49edb7-45f3-4478-849e-badd08ee0930'))).toBe('ifnull("s1"."orders"."order_id", \'6a49edb7-45f3-4478-849e-badd08ee0930\')');
    });

    it('should escape a buffer', () => {
      expect(d.escape(Buffer.from('Hello'))).toBe("X'48656c6c6f'");
    });

  });

  describe('mysql dialect', () => {

    const d = dialects.mysql;

    if(d) {
      it('should escape a plain string', () => {
        expect(d.escape('a')).toBe('\'a\'');
      });

      it('should escape an integer', () => {
        expect(d.escape(8)).toBe('8');
      });

      it('should escape a plain string with quotes', () => {
        expect(d.escape('a\'\"[]$%_`\\')).toBe('\'a\\\'\\\"[]$%_`\\\\\'');
      });

      it('should escape an id', () => {
        expect(d.escapeId('a')  ).toBe('`a`');
        expect(d.escape(Identifier('a'))).toBe('`a`');
      });

      it('should escape an id with quotes', () => {
        expect(d.escapeId('\'\"`a')  ).toBe('`\'"``a`');
        expect(d.escape(Identifier('\'\"`a'))).toBe('`\'"``a`');
      });

      it('should escape a date', () => {
        expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01 00:00:00\'');
      });

      it('should escape a date with time', () => {
        expect(d.escape(new Date(2020, 3, 1, 8, 2, 48))).toBe('\'2020-04-01 08:02:48\'');
      });

      it('should escape a moment', () => {
        expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01 00:00:00\'');
      });

      it('should escape a moment with time', () => {
        expect(d.escape(moment('2020-04-01 23:10:32'))).toBe('\'2020-04-01 23:10:32\'');
      });

      it('should escape a dateonly given by a Date', () => {
        expect(d.escape(DateOnly(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01\'');
      });

      it('should escape a dateonly given by a moment', () => {
        expect(d.escape(DateOnly(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01\'');
      });

      it('should escape a datetime given by a string', () => {
        expect(d.escape(DateOnly('2020-04-01 13:07:14'))).toBe('\'2020-04-01\'');
      });

      it('should not escape a verbatim clause', () => {
        expect(d.escape(Verbatim('\'"`%_ \''))).toBe('\'"`%_ \'')
      });

      it('should escape a function', () => {
        expect(d.escape(Fn('test_func', 5, 8))).toBe('test_func(5, 8)');
      });

      it('should escape a column', () => {
        const t = tables.orders;
        expect(d.escape(t.column('order_id'))).toBe('"s1"."orders"."order_id"');
      });

      it('should escape a function with column as parameter', () => {
        const t = tables.orders;
        expect(d.escape(Fn('ifnull', t.column('order_id'), '6a49edb7-45f3-4478-849e-badd08ee0930'))).toBe('ifnull("s1"."orders"."order_id", \'6a49edb7-45f3-4478-849e-badd08ee0930\')');
      });

      it('should escape a buffer', () => {
        expect(d.escape(Buffer.from('Hello'))).toBe("X'48656c6c6f'");
      });

    }
  });

  describe('sqlite dialect', () => {

    const d = dialects.sqlite;

    if(d) {
      it('should escape a plain string', () => {
        expect(d.escape('a')).toBe('\'a\'');
      });

      it('should escape an integer', () => {
        expect(d.escape(8)).toBe('8');
      });

      it('should escape a plain string with quotes', () => {
        expect(d.escape('a\'\"[]$%_`\\')).toBe('\'a\'\'\"[]$%_`\\\'');
      });

      it('should escape an id', () => {
        expect(d.escapeId('a')  ).toBe('"a"');
        expect(d.escape(Identifier('a'))).toBe('"a"');
      });

      it('should escape an id with quotes', () => {
        expect(d.escapeId('\'\"`a')  ).toBe('"\'""`a"');
        expect(d.escape(Identifier('\'\"`a'))).toBe('"\'""`a"');
      });

      it('should escape a date', () => {
        expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01 00:00:00\'');
      });

      it('should escape a date with time', () => {
        expect(d.escape(new Date(2020, 3, 1, 7, 39, 12))).toBe('\'2020-04-01 07:39:12\'');
      });

      it('should escape a moment', () => {
        expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01 00:00:00\'');
      });

      it('should escape a moment with time', () => {
        expect(d.escape(moment('2020-04-01 14:59:12'))).toBe('\'2020-04-01 14:59:12\'');
      });

      it('should escape a dateonly given by a Date', () => {
        expect(d.escape(DateOnly(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01\'');
      });

      it('should escape a dateonly given by a moment', () => {
        expect(d.escape(DateOnly(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01\'');
      });

      it('should escape a dateonly given by a string', () => {
        expect(d.escape(DateOnly('2020-04-01 13:07:14'))).toBe('\'2020-04-01\'');
      });

      it('should not escape a verbatim clause', () => {
        expect(d.escape(Verbatim('\'"`%_ \''))).toBe('\'"`%_ \'')
      });

      it('should escape a function', () => {
        expect(d.escape(Fn('test_func', 5, 8))).toBe('test_func(5, 8)');
      });

      it('should escape a column', () => {
        const t = tables.orders;
        expect(d.escape(t.column('order_id'))).toBe('"s1"."orders"."order_id"');
      });

      it('should escape a function with column as parameter', () => {
        const t = tables.orders;
        expect(d.escape(Fn('ifnull', t.column('order_id'), '6a49edb7-45f3-4478-849e-badd08ee0930'))).toBe('ifnull("s1"."orders"."order_id", \'6a49edb7-45f3-4478-849e-badd08ee0930\')');
      });

      it('should escape a buffer', () => {
        expect(d.escape(Buffer.from('Hello'))).toBe("X'48656c6c6f'");
      });

    }
  });

  describe('postgresql dialect', () => {

    const d = dialects.postgres;

    if(d) {
      it('should escape a plain string', () => {
        expect(d.escape('a')).toBe('\'a\'');
      });

      it('should escape an integer', () => {
        expect(d.escape(8)).toBe('8');
      });

      it('should escape a plain string with quotes', () => {
        expect(d.escape('a\'\"[]$%_`\\')).toBe('\'a\'\'\"[]$%_`\\\'');
      });

      it('should escape an id', () => {
        expect(d.escapeId('a')  ).toBe('"a"');
        expect(d.escape(Identifier('a'))).toBe('"a"');
      });

      it('should escape an id with quotes', () => {
        expect(d.escapeId('\'\"`a')  ).toBe('"\'""`a"');
        expect(d.escape(Identifier('\'\"`a'))).toBe('"\'""`a"');
      });

      it('should escape a date', () => {
        expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01 00:00:00\'');
      });

      it('should escape a date with time', () => {
        expect(d.escape(new Date(2020, 3, 1, 17, 8, 49))).toBe('\'2020-04-01 17:08:49\'');
      });

      it('should escape a moment', () => {
        expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01 00:00:00\'');
      });

      it('should escape a moment with time', () => {
        expect(d.escape(moment('2020-04-01 11:41:11'))).toBe('\'2020-04-01 11:41:11\'');
      });

      it('should escape a dateonly given by a Date', () => {
        expect(d.escape(DateOnly(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01\'');
      });

      it('should escape a dateonly given by a moment', () => {
        expect(d.escape(DateOnly(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01\'');
      });

      it('should escape a dateonly given by a string', () => {
        expect(d.escape(DateOnly('2020-04-01 13:07:14'))).toBe('\'2020-04-01\'');
      });

      it('should not escape a verbatim clause', () => {
        expect(d.escape(Verbatim('\'"`%_ \''))).toBe('\'"`%_ \'')
      });

      it('should escape a function', () => {
        expect(d.escape(Fn('test_func', 5, 8))).toBe('test_func(5, 8)');
      });

      it('should escape a column', () => {
        const t = tables.orders;
        expect(d.escape(t.column('order_id'))).toBe('"s1"."orders"."order_id"');
      });

      it('should escape a function with column as parameter', () => {
        const t = tables.orders;
        expect(d.escape(Fn('ifnull', t.column('order_id'), '6a49edb7-45f3-4478-849e-badd08ee0930'))).toBe('ifnull("s1"."orders"."order_id", \'6a49edb7-45f3-4478-849e-badd08ee0930\')');
      });

      it('should escape a buffer', () => {
        expect(d.escape(Buffer.from('Hello'))).toBe("'\\x48656c6c6f'");
      });

    }
  });

});
