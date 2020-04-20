'use strict';

const dialects = require('../src/dialects');
const Identifier = require('../src/identifier');
const Verbatim = require('../src/verbatim');
const DateTime = require('../src/datetime');
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
      expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01\'');
    });

    it('should escape a moment', () => {
      expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01\'');
    });

    it('should escape a datetime given by a Date', () => {
      expect(d.escape(DateTime(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01 13:07:14\'');
    });

    it('should escape a datetime given by a moment', () => {
      expect(d.escape(DateTime(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01 13:07:14\'');
    });

    it('should escape a datetime given by a string', () => {
      expect(d.escape(DateTime('2020-04-01 13:07:14'))).toBe('\'2020-04-01 13:07:14\'');
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
        expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01\'');
      });

      it('should escape a moment', () => {
        expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01\'');
      });

      it('should escape a datetime given by a Date', () => {
        expect(d.escape(DateTime(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01 13:07:14\'');
      });

      it('should escape a datetime given by a moment', () => {
        expect(d.escape(DateTime(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01 13:07:14\'');
      });

      it('should escape a datetime given by a string', () => {
        expect(d.escape(DateTime('2020-04-01 13:07:14'))).toBe('\'2020-04-01 13:07:14\'');
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
        expect(d.escape(new Date(2020, 3, 1))).toBe('\'2020-04-01\'');
      });

      it('should escape a moment', () => {
        expect(d.escape(moment('2020-04-01'))).toBe('\'2020-04-01\'');
      });

      it('should escape a datetime given by a Date', () => {
        expect(d.escape(DateTime(new Date(2020, 3, 1, 13, 7, 14)))).toBe('\'2020-04-01 13:07:14\'');
      });

      it('should escape a datetime given by a moment', () => {
        expect(d.escape(DateTime(moment('2020-04-01 13:07:14')))).toBe('\'2020-04-01 13:07:14\'');
      });

      it('should escape a datetime given by a string', () => {
        expect(d.escape(DateTime('2020-04-01 13:07:14'))).toBe('\'2020-04-01 13:07:14\'');
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
    }
  });

});
