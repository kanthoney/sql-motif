'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe("validate tests", () => {

  describe('table tests', () => {

    describe('orders tests', () => {

      const t = tables.orders;

      it("should validate correct record", () => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          }
        };
        expect(JSON.stringify(t.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}}},' +
          '"valid":true,"errors":{}}],"valid":true}'
        );
      });

      it("should fail on empty street", () => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          }
        };
        expect(JSON.stringify(t.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}}},' +
          '"valid":false,"errors":{"invoice":{"address":{"street":"Street must not be empty"}}}}],"valid":false}'
        );
      });

      it("should fail on empty name", () => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: '',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          }
        };
        expect(JSON.stringify(t.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"",' +
          '"postalCode":"HD18 9TT","country":"GB"}},"invoice":{"name":"","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester",' +
          '"region":"","postalCode":"M1 4JF","country":"GB"}}},"valid":false,"errors":{"invoice":{"name":"Name must not be empty"}}}],"valid":false}'
        );
      });

      it("should fail on invalid country", () => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'AU'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          }
        };
        expect(JSON.stringify(t.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"AU"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}}},' +
          '"valid":false,"errors":{"delivery":{"address":{"country":"Invalid country code"}}}}],"valid":false}'
        );
      });

      it("should pass key validation despite invalid country", () => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'AU'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          }
        };
        expect(JSON.stringify(t.validateKey(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"AU"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}}},' +
          '"valid":true,"errors":{}}],"valid":true}'
        );
      });

      it("should validate correct record with function field", () => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: ({ sql }) => sql`curdate()`,
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          }
        };
        const validated = t.validate(record);
        expect(validated.valid).toBe(true);
        expect(validated.records[0].data.order_date instanceof Function).toBe(true);
        expect(JSON.stringify(validated.validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}}},' +
          '"valid":true,"errors":{}}],"valid":true}'
        );
      });

    });

    describe("Order lines tests", () => {

      const t = tables.order_lines;

      it("should validate empty list of order lines", () => {
        const records = [];
        expect(JSON.stringify(t.validate(records).validationResult())).toBe(
          '{"results":[],"valid":true}'
        );
      });

      it("should validate list of valid order lines", () => {
        const records = [
          {
            company: 'AA5496',
            order_id: 'fa52237c-c6f2-4063-a541-44720840cc9b',
            line_no: 1,
            sku: 'AAJ191',
            description: 'Hammer',
            qty: 5,
            price: '8.32'
          },
          {
            company: 'AA5496',
            order_id: 'fa52237c-c6f2-4063-a541-44720840cc9b',
            line_no: 2,
            sku: 'AA8708',
            description: 'Saw',
            qty: 8,
            price: '13.54'
          },
        ];
        expect(JSON.stringify(t.validate(records).validationResult())).toBe(
          '{"results":[{"record":{"company":"AA5496","order_id":"fa52237c-c6f2-4063-a541-44720840cc9b","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '"valid":true,"errors":{}},{"record":{"company":"AA5496","order_id":"fa52237c-c6f2-4063-a541-44720840cc9b","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"},' +
          '"valid":true,"errors":{}}],"valid":true}'
        );
      });

      it("should validate list of valid order lines", () => {
        const records = [
          {
            company: 'AA5496',
            order_id: 'fa52237c-c6f2-4063-a541-44720840cc9b',
            line_no: 1,
            sku: 'AAJ191',
            description: 'Hammer',
            qty: 5,
            price: '8.32'
          },
          {
            company: 'AA5496',
            order_id: 'fa52237c-c6f2-4063-a541-44720840cc9b',
            line_no: 2,
            sku: 'AA8708',
            description: 'Saw',
            qty: 8,
            price: '13.54'
          },
        ];
        expect(JSON.stringify(t.validate(records).validationResult())).toBe(
          '{"results":[{"record":{"company":"AA5496","order_id":"fa52237c-c6f2-4063-a541-44720840cc9b","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '"valid":true,"errors":{}},{"record":{"company":"AA5496","order_id":"fa52237c-c6f2-4063-a541-44720840cc9b","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"},' +
          '"valid":true,"errors":{}}],"valid":true}'
        );
      });

    });

  });

  describe('join tests', () => {

    describe('orders tests', () => {

      const j = joins.orders;

      it("should validate correct order", done => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              sku: 'AA8708',
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record, { allowEmptyStreets: true }).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
        );
        j.validateAsync(record, { allowEmptyStreets: true }).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
          );
        }).catch(fail).finally(done);
      });

      it("should fail validation on missing order no", done => {
        const record = {
          company: 'ACE010',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              sku: 'AA8708',
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive",' +
          '"locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close",' +
          '"locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,' +
          '"price":"8.32"},{"company":"ACE010","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID",' +
          '"lines":[{"order_id":"Invalid UUID"},{"order_id":"Invalid UUID"}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive",' +
            '"locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close",' +
            '"locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,' +
            '"price":"8.32"},{"company":"ACE010","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID",' +
            '"lines":[{"order_id":"Invalid UUID"},{"order_id":"Invalid UUID"}]}}],"valid":false}'
          );
        }).catch(fail).finally(done);
      });

      it("should fail validation on missing order no and sku", done => {
        const record = {
          company: 'ACE010',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              sku: '',
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test",' +
          '"address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},{"company":"ACE010","line_no":2,"sku":"",' +
          '"description":"Saw","qty":8,"price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID","lines":[{"order_id":"Invalid UUID"},' +
          '{"order_id":"Invalid UUID","sku":"SKU must not be empty"}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test",' +
            '"address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},{"company":"ACE010","line_no":2,"sku":"",' +
            '"description":"Saw","qty":8,"price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID","lines":[{"order_id":"Invalid UUID"},' +
            '{"order_id":"Invalid UUID","sku":"SKU must not be empty"}]}}],"valid":false}'
          );
        }).catch(fail).finally(done);
      });

      it("should fail validation on missing sku", done => {
        const record = {
          company: 'ACE010',
          order_id: '3cea0a72-0e82-4a97-aea2-e28293e8fae6',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              sku: '',
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
          expect(JSON.stringify(j.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":2,"sku":"","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
          '"errors":{"lines":[{},{"sku":"SKU must not be empty"}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":2,"sku":"","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
            '"errors":{"lines":[{},{"sku":"SKU must not be empty"}]}}],"valid":false}'
          );
        }).catch(fail).finally(done);
      });

      it("should not fail validation on missing sku", done => {
        const record = {
          company: 'ACE010',
          order_id: '3cea0a72-0e82-4a97-aea2-e28293e8fae6',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record, { ignoreMissing: true }).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":2,"description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
        );
        j.validateAsync(record, { ignoreMissing: true }).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":2,"description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
          );
        }).catch(fail).finally(done);
      });

      it("should not fail validation on missing order_id but not on missing qty", done => {
        const record = {
          company: 'ACE010',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              sku: 'AA8708',
              description: 'Saw',
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record, { ignoreMissingNonKey: true }).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive",' +
          '"locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close",' +
          '"locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","line_no":2,"sku":"AA8708","description":"Saw","price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID","lines":[{"order_id":"Invalid UUID"},' +
          '{"order_id":"Invalid UUID"}]}}],"valid":false}'
        );
        j.validateAsync(record, { ignoreMissingNonKey: true }).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive",' +
            '"locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close",' +
            '"locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","line_no":2,"sku":"AA8708","description":"Saw","price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID","lines":[{"order_id":"Invalid UUID"},' +
            '{"order_id":"Invalid UUID"}]}}],"valid":false}'
          );
        }).catch(fail).finally(done);
      });

      it("should fail on invalid qty", done => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '18 Mansfield Drive',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '£8.32'
            },
            {
              line_no: 2,
              sku: 'AA8708',
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"£8.32"},' +
          '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
          '"errors":{"lines":[{"price":"Invalid price"},{}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"£8.32"},' +
            '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
            '"errors":{"lines":[{"price":"Invalid price"},{}]}}],"valid":false}'
          );
        }).catch(fail).finally(done);
      });

      it("should validate order despite missing street because of context", done => {
        const record = {
          company: 'ACE010',
          order_id: '23283525-8093-11ea-943b-06980bf53d08',
          customer: 'NEF202',
          order_date: '2020-04-16',
          delivery: {
            name: 'Terry Test',
            address: {
              company: '',
              street: '',
              locality: '',
              city: 'Huddersfield',
              region: '',
              postalCode: 'HD18 9TT',
              country: 'GB'
            }
          },
          invoice: {
            name: 'Belinda Berger',
            address: {
              company: '',
              street: '40 Netfield Close',
              locality: '',
              city: 'Manchester',
              region: '',
              postalCode: 'M1 4JF',
              country: 'GB'
            }
          },
          lines: [
            {
              line_no: 1,
              sku: 'AAJ191',
              description: 'Hammer',
              qty: 5,
              price: '8.32'
            },
            {
              line_no: 2,
              sku: 'AA8708',
              description: 'Saw',
              qty: 8,
              price: '13.54'
            }
          ]
        };
        expect(JSON.stringify(j.validate(record, { context: { allowEmptyStreets: true } }).validationResult())).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
        );
        j.validateAsync(record, { context: { allowEmptyStreets: true } }).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
          );
        }).catch(fail).finally(done);
      });

    });

    describe("inventory2 tests", () => {

      const j = joins.inventory2;

      it('should validate correct record', done => {
        const record = {
          company: 'AAZ909',
          sku: 'CUP001',
          description: 'Sink plunger',
          warehouse: [
            {
              name: 'Atlas',
              description: 'Comfy',
              address: {
                company: 'Hot Stuff Ltd',
                street: '9 Blarney St',
                locality: 'Expressions Business Park',
                city: 'Huddersfield',
                region: '',
                postalCode: 'HD7 9XJ',
                country: 'GB'
              },
              bins: [
                {
                  bin: 'AD14E2',
                  inventory: [
                    {
                      qty: 16,
                      cost: 7.68,
                      time: '2020-01-22 16:14:14'
                    },
                    {
                      qty: 8,
                      cost: 7.68,
                      time: '2019-06-12 16:48:34'
                    }
                  ]
                },
                {
                  bin: 'AL15A1',
                  inventory: [
                    {
                      qty: 9,
                      cost: 8.34,
                      time: '2019-11-21 09:12:54'
                    }
                  ]
                }
              ]
            },
            {
              name: 'Mercury',
              description: 'Cramped',
              address: {
                company: 'Hot Stuff Ltd',
                street: '18 Heaton St',
                locality: '',
                city: 'Birmingham',
                region: '',
                postalCode: 'B12 8GL',
                country: 'GB'
              },
              bins: [
                {
                  bin: 'D56A',
                  inventory: {
                    cost: 6.75,
                    qty: 8,
                    time: '2018-09-17 10:46:29'
                  }
                }
              ]
            }
          ]
        };
        expect(JSON.stringify(j.validate(record).validationResult())).toBe(
          '{"results":[{"record":{"company":"AAZ909","sku":"CUP001","description":"Sink plunger","warehouse":[{"company":"AAZ909","name":"Atlas","description":"Comfy",' +
          '"address":{"company":"Hot Stuff Ltd","street":"9 Blarney St","locality":"Expressions Business Park","city":"Huddersfield","region":"","postalCode":"HD7 9XJ","country":"GB"},' +
          '"bins":[{"company":"AAZ909","warehouse_name":"Atlas","bin":"AD14E2","inventory":[{"company":"AAZ909","sku":"CUP001","warehouse_name":"Atlas","bin":"AD14E2",' +
          '"time":"2020-01-22 16:14:14","qty":16,"cost":7.68},{"company":"AAZ909","sku":"CUP001","warehouse_name":"Atlas","bin":"AD14E2","time":"2019-06-12 16:48:34","qty":8,"cost":7.68}]},' +
          '{"company":"AAZ909","warehouse_name":"Atlas","bin":"AL15A1","inventory":[{"company":"AAZ909","sku":"CUP001","warehouse_name":"Atlas","bin":"AL15A1",' +
          '"time":"2019-11-21 09:12:54","qty":9,"cost":8.34}]}]},{"company":"AAZ909","name":"Mercury","description":"Cramped","address":{"company":"Hot Stuff Ltd","street":"18 Heaton St",' +
          '"locality":"","city":"Birmingham","region":"","postalCode":"B12 8GL","country":"GB"},"bins":[{"company":"AAZ909","warehouse_name":"Mercury","bin":"D56A",' +
          '"inventory":[{"company":"AAZ909","sku":"CUP001","warehouse_name":"Mercury","bin":"D56A","time":"2018-09-17 10:46:29","qty":8,"cost":6.75}]}]}]},"valid":true,"errors":{}}],"valid":true}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result.validationResult())).toBe(
            '{"results":[{"record":{"company":"AAZ909","sku":"CUP001","description":"Sink plunger","warehouse":[{"company":"AAZ909","name":"Atlas","description":"Comfy",' +
            '"address":{"company":"Hot Stuff Ltd","street":"9 Blarney St","locality":"Expressions Business Park","city":"Huddersfield","region":"","postalCode":"HD7 9XJ","country":"GB"},' +
            '"bins":[{"company":"AAZ909","warehouse_name":"Atlas","bin":"AD14E2","inventory":[{"company":"AAZ909","sku":"CUP001","warehouse_name":"Atlas","bin":"AD14E2",' +
            '"time":"2020-01-22 16:14:14","qty":16,"cost":7.68},{"company":"AAZ909","sku":"CUP001","warehouse_name":"Atlas","bin":"AD14E2","time":"2019-06-12 16:48:34","qty":8,"cost":7.68}]},' +
            '{"company":"AAZ909","warehouse_name":"Atlas","bin":"AL15A1","inventory":[{"company":"AAZ909","sku":"CUP001","warehouse_name":"Atlas","bin":"AL15A1",' +
            '"time":"2019-11-21 09:12:54","qty":9,"cost":8.34}]}]},{"company":"AAZ909","name":"Mercury","description":"Cramped","address":{"company":"Hot Stuff Ltd","street":"18 Heaton St",' +
            '"locality":"","city":"Birmingham","region":"","postalCode":"B12 8GL","country":"GB"},"bins":[{"company":"AAZ909","warehouse_name":"Mercury","bin":"D56A",' +
            '"inventory":[{"company":"AAZ909","sku":"CUP001","warehouse_name":"Mercury","bin":"D56A","time":"2018-09-17 10:46:29","qty":8,"cost":6.75}]}]}]},"valid":true,"errors":{}}],"valid":true}'
          );
        }).catch(fail).finally(done);
      });

    });

  });

  describe('validation table tests', () => {

    const t = tables.validation;

    it('should validate record', () => {
      const record = {
        string: 'valid',
        'function': 'valid',
        regexp: 'valid',
        array: 'valid2',
        string_null: 'valid',
        'function_null': 'valid',
        regexp_null: 'valid',
        array_null: 'valid1',
        string_nullify: 'valid',
        'function_nullify': 'valid',
        regexp_nullify: 'valid',
        array_nullify: 'valid2'
      };
      expect(JSON.stringify(t.validate(record).validationResult())).toBe(
        '{"results":[{"record":{"string":"valid","function":"valid","regexp":"valid","array":"valid2","string_null":"valid","function_null":"valid",' +
          '"regexp_null":"valid","array_null":"valid1","string_nullify":"valid","function_nullify":"valid","regexp_nullify":"valid","array_nullify":"valid2"},' +
          '"valid":true,"errors":{}}],"valid":true}'
      );
    });

    it('should validate record asynchronously', done => {
      const record = {
        string: 'valid',
        'function': 'valid',
        regexp: 'valid',
        array: 'valid2',
        string_null: 'valid',
        'function_null': 'valid',
        regexp_null: 'valid',
        array_null: 'valid1',
        string_nullify: 'valid',
        'function_nullify': 'valid',
        regexp_nullify: 'valid',
        array_nullify: 'valid1'        
      };
      t.validateAsync(record).then(result => {
        expect(JSON.stringify(result.validationResult())).toBe(
          '{"results":[{"record":{"string":"valid","function":"valid","regexp":"valid","array":"valid2","string_null":"valid","function_null":"valid",' +
            '"regexp_null":"valid","array_null":"valid1","string_nullify":"valid","function_nullify":"valid","regexp_nullify":"valid","array_nullify":"valid1"},' +
            '"valid":true,"errors":{}}],"valid":true}');
      }).catch(fail).finally(done);
    });

    it('should invalidate record', () => {
      const record = {
        string: 'invalid',
        'function': 'invalid',
        regexp: 'invalid',
        array: 'invalid2',
        string_null: 'invalid',
        'function_null': 'invalid',
        regexp_null: 'invalid',
        array_null: 'invalid1',
        string_nullify: 'invalid',
        'function_nullify': 'invalid',
        regexp_nullify: 'invalid',
        array_nullify: 'invalid1'        
      };
      expect(JSON.stringify(t.validate(record, { context: { invalid: '_' } }).validationResult())).toBe(
        '{"results":[{"record":{"string":"invalid","function":"invalid","regexp":"invalid","array":"invalid2","string_null":"invalid","function_null":"invalid",' +
          '"regexp_null":"invalid","array_null":"invalid1","string_nullify":null,"function_nullify":"_invalid","regexp_nullify":"invalid_regexp_nullify",' +
          '"array_nullify":"_"},"valid":false,"errors":{"string":"Field is not valid","function":"Field failed function validation",' +
          '"regexp":"Field did not conform to regular expression \'/^valid$/\'","array":"Field did not match any validator","string_null":"Field is not valid",' +
          '"function_null":"Field failed function validation","regexp_null":"Field did not conform to regular expression \'/^valid$/\'",' +
          '"array_null":"Field did not match any validator"}}],"valid":false}'
      );
    });

    it('should invalidate record asynchronously', done => {
      const record = {
        string: 'invalid',
        'function': 'invalid',
        regexp: 'invalid',
        array: 'invalid2',
        string_null: 'invalid',
        'function_null': 'invalid',
        regexp_null: 'invalid',
        array_null: 'invalid1',
        string_nullify: 'invalid',
        'function_nullify': 'invalid',
        regexp_nullify: 'invalid',
        array_nullify: 'invalid1'        
      };
      t.validateAsync(record, { context: { invalid: '_' } }).then(result => {
        expect(JSON.stringify(result.validationResult())).toBe(
        '{"results":[{"record":{"string":"invalid","function":"invalid","regexp":"invalid","array":"invalid2","string_null":"invalid","function_null":"invalid",' +
          '"regexp_null":"invalid","array_null":"invalid1","string_nullify":null,"function_nullify":"_invalid","regexp_nullify":"invalid_regexp_nullify",' +
          '"array_nullify":"_"},"valid":false,"errors":{"string":"Field is not valid","function":"Field failed function validation",' +
          '"regexp":"Field did not conform to regular expression \'/^valid$/\'","array":"Field did not match any validator","string_null":"Field is not valid",' +
          '"function_null":"Field failed function validation","regexp_null":"Field did not conform to regular expression \'/^valid$/\'",' +
          '"array_null":"Field did not match any validator"}}],"valid":false}'
        );
      }).catch(fail).finally(done);
    });

  });

  describe('validate join tests', () => {

    const { Table } = require('../index');

    const t1 = new Table({
      name: 't1',
      columns: [
        { name: 'a', primaryKey: true, validate: /./, validationError: 'Empty' }
      ]
    });

    const t2 = new Table({
      name: 't2',
      columns: [
        { name: 'a', primaryKey: true, validate: /./, validationError: 'Empty' },
        { name: 'b', primaryKey: true, validate: /./, validationError: 'Empty' }
      ]
    });

    const j = t1.join({
      name: 't2',
      table: t2,
      on: 'a'
    });

    it('should validate all subrecords', () => {
      expect(JSON.stringify(j.validate({ a: 'a', t2: [{ b: '' }, { b: '' }] }).validationResult())).toBe(
        '{"results":[{"record":{"a":"a","t2":[{"a":"a","b":""},{"a":"a","b":""}]},"valid":false,"errors":{"t2":[{"b":"Empty"},{"b":"Empty"}]}}],"valid":false}'
      );
    });

  });

});
