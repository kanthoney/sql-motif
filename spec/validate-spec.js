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
        expect(JSON.stringify(t.validate(record))).toBe(
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
        expect(JSON.stringify(t.validate(record))).toBe(
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
        expect(JSON.stringify(t.validate(record))).toBe(
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
        expect(JSON.stringify(t.validate(record))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"AU"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}}},' +
          '"valid":false,"errors":{"delivery":{"address":{"country":"Invalid country code"}}}}],"valid":false}'
        );
      });

    });

    describe("Order lines tests", () => {

      const t = tables.order_lines;

      it("should validate empty list of order lines", () => {
        const records = [];
        expect(JSON.stringify(t.validate(records))).toBe(
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
        expect(JSON.stringify(t.validate(records))).toBe(
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
        expect(JSON.stringify(t.validate(records))).toBe(
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
        expect(JSON.stringify(j.validate(record))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result)).toBe(
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
        expect(JSON.stringify(j.validate(record))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive",' +
          '"locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close",' +
          '"locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,' +
          '"price":"8.32"},{"company":"ACE010","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID",' +
          '"lines":[{"order_id":"Invalid UUID"},{"order_id":"Invalid UUID"}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result)).toBe(
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
        expect(JSON.stringify(j.validate(record))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_date":"2020-04-16","customer":"NEF202","delivery":{"name":"Terry Test",' +
          '"address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},{"company":"ACE010","line_no":2,"sku":"",' +
          '"description":"Saw","qty":8,"price":"13.54"}]},"valid":false,"errors":{"order_id":"Invalid UUID","lines":[{"order_id":"Invalid UUID"},' +
          '{"order_id":"Invalid UUID","sku":"SKU must not be empty"}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result)).toBe(
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
        expect(JSON.stringify(j.validate(record))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":2,"sku":"","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
          '"errors":{"lines":[{},{"sku":"SKU must not be empty"}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result)).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","order_id":"3cea0a72-0e82-4a97-aea2-e28293e8fae6","line_no":2,"sku":"","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
            '"errors":{"lines":[{},{"sku":"SKU must not be empty"}]}}],"valid":false}'
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
        expect(JSON.stringify(j.validate(record))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"18 Mansfield Drive","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"£8.32"},' +
          '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":false,' +
          '"errors":{"lines":[{"price":"Invalid price"},{}]}}],"valid":false}'
        );
        j.validateAsync(record).then(result => {
          expect(JSON.stringify(result)).toBe(
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
        expect(JSON.stringify(j.validate(record, { allowEmptyStreets: true }))).toBe(
          '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
          '"delivery":{"name":"Terry Test","address":{"company":"","street":"","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
          '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
          '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
          '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
        );
        j.validateAsync(record, { allowEmptyStreets: true }).then(result => {
          expect(JSON.stringify(result)).toBe(
            '{"results":[{"record":{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","order_date":"2020-04-16","customer":"NEF202",' +
            '"delivery":{"name":"Terry Test","address":{"company":"","street":"","locality":"","city":"Huddersfield","region":"","postalCode":"HD18 9TT","country":"GB"}},' +
            '"invoice":{"name":"Belinda Berger","address":{"company":"","street":"40 Netfield Close","locality":"","city":"Manchester","region":"","postalCode":"M1 4JF","country":"GB"}},' +
            '"lines":[{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":1,"sku":"AAJ191","description":"Hammer","qty":5,"price":"8.32"},' +
            '{"company":"ACE010","order_id":"23283525-8093-11ea-943b-06980bf53d08","line_no":2,"sku":"AA8708","description":"Saw","qty":8,"price":"13.54"}]},"valid":true,"errors":{}}],"valid":true}'
          );
        }).catch(fail).finally(done);
      });

    });

  });

});
