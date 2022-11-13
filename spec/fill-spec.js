'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('fill tests', () => {

  describe('table tests', () => {

    describe('orders tests', () => {

      const t = tables.orders;

      it('should fill in default values for empty fields', () => {
        const recordSet = t.fill({}).toJSON();
        expect(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(recordSet[0].order_id)).toBeTruthy();
      });

      it('should not fill in full record', done => {
        const record = {
          company: "AAD010",
          order_id: "df4441f0-e41a-4ea8-8217-00c9c2983fe2",
          customer: "JNX79",
          order_date: "2020-04-18",
          delivery: {
            name: "Mr Harry White",
            address: {
              street: "50 Whitworth Close",
              company: "Future Technologies Limited",
              locality: "",
              city: "Manchester",
              postalCode: "M1 10WB",
              region:"",
              country: "GB"
            }
          },
          invoice: {
            name: "Mr Francis Underwood",
            address: {
              street: "49 Baker Close",
              company: "Kingsbury PLC",
              locality:"",
              city: "London",
              postalCode: "N13 1NC",
              region: "",
              country: "GB"
            }
          }
        };
        expect(JSON.stringify(t.fill(record))).toBe(
          '[{"company":"AAD010","order_id":"df4441f0-e41a-4ea8-8217-00c9c2983fe2","order_date":"2020-04-18","customer":"JNX79","delivery":{"name":"Mr Harry White",' +
          '"address":{"company":"Future Technologies Limited","street":"50 Whitworth Close","locality":"","city":"Manchester","region":"","postalCode":"M1 10WB","country":"GB"}},' +
          '"invoice":{"name":"Mr Francis Underwood","address":{"company":"Kingsbury PLC","street":"49 Baker Close","locality":"","city":"London","region":"","postalCode":"N13 1NC","country":"GB"}}}]'
        );
        t.fillAsync(record).then(result => {
          expect(JSON.stringify(result)).toBe(
            '[{"company":"AAD010","order_id":"df4441f0-e41a-4ea8-8217-00c9c2983fe2","order_date":"2020-04-18","customer":"JNX79","delivery":{"name":"Mr Harry White",' +
              '"address":{"company":"Future Technologies Limited","street":"50 Whitworth Close","locality":"","city":"Manchester","region":"","postalCode":' +
              '"M1 10WB","country":"GB"}},"invoice":{"name":"Mr Francis Underwood","address":{"company":"Kingsbury PLC","street":"49 Baker Close","locality":"",' +
              '"city":"London","region":"","postalCode":"N13 1NC","country":"GB"}}}]'
          );
        }).catch(fail).finally(done);
      });
      
    });
    
  });
  
  describe('join tests', () => {
    
    describe('orders tests', () => {
      
      const j = joins.orders;
      
      it('should fill empty record', () => {
        const result = j.fill({});
        const order_id = result.toJSON()[0].order_id;
        expect(JSON.stringify(result)).toBe(
          `[{"order_id":"${order_id}","delivery":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` +
             `"invoice":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}}}]`
        );
      });
        
      it('should fill empty record', () => {
        const record = {
          lines: [
            {
              sku: 'AA451',
              description: 'Hammer',
              qty: 5,
              cost: 8.64
            },
            {
              sku: 'GN878',
              description: 'Screwdriver',
              qty: 8,
              cost: 7.83
            }
          ]
        };
        const result = j.fill(record);
        const order_id = result.toJSON()[0].order_id;
        expect(JSON.stringify(result)).toBe(
          `[{"order_id":"${order_id}","delivery":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` +
             `"invoice":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` +
             `"lines":[{"order_id":"${order_id}","line_no":1,"sku":"AA451","description":"Hammer","qty":5},` +
                       `{"order_id":"${order_id}","line_no":2,"sku":"GN878","description":"Screwdriver","qty":8}]}]`
        );
      });
      
      it('should fill empty records', () => {
        const records = [
          {
            lines: [
              {
                sku: 'AA451',
                description: 'Hammer',
                qty: 5,
                cost: 8.64
              },
              {
                sku: 'GN878',
                description: 'Screwdriver',
                qty: 8,
                cost: 7.83
              }
            ]
          },
          {
            lines: [
              {
                sku: 'VB989',
                description: 'Pliers',
                cost: 5.34,
                qty: 1
              },
              {
                sku: 'WS565',
                description: 'Wire cutters',
                cost: 8.45,
                qty: 1
              },
              {
                sku: 'SC674',
                description: 'Hacksaw',
                cost: 6.56,
                qty: 2
              }
            ]
          }
        ];
        const result = j.fill(records);
        const order_ids = result.toJSON().map(record => record.order_id);
        expect(JSON.stringify(result)).toBe(
          `[{"order_id":"${order_ids[0]}","delivery":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` +
             `"invoice":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` + 
             `"lines":[{"order_id":"${order_ids[0]}","line_no":1,"sku":"AA451","description":"Hammer","qty":5},` +
                       `{"order_id":"${order_ids[0]}","line_no":2,"sku":"GN878","description":"Screwdriver","qty":8}]},` +
            `{"order_id":"${order_ids[1]}","delivery":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` +
              `"invoice":{"name":"","address":{"company":"","street":"","locality":"","city":"","region":"","postalCode":"","country":"GB"}},` +
              `"lines":[{"order_id":"${order_ids[1]}","line_no":1,"sku":"VB989","description":"Pliers","qty":1},` +
                        `{"order_id":"${order_ids[1]}","line_no":2,"sku":"WS565","description":"Wire cutters","qty":1},` +
                        `{"order_id":"${order_ids[1]}","line_no":3,"sku":"SC674","description":"Hacksaw","qty":2}]}]`
        );
      });
      
    });

  });

  describe('selectors', () => {

    const { Table } = require('../index');

    const t = new Table({
      name: 'a',
      columns: [
        { name: 'a', notNull: true, primaryKey: true, default: () => 'a' },
        { name: 'b', notNull: true, default: () => 'b' },
        { name: 'c', notNull: true, default: () => 'c' }
      ]
    });

    it('should fill in primary key', done => {
      const selector = col => col.primaryKey;
      expect(JSON.stringify(t.fill({ c: 'c1' }, { selector }))).toBe(
        '[{"a":"a","c":"c1"}]'
      );
      t.fillAsync({ c: 'c1' }, { selector }).then(result => {
        expect(JSON.stringify(result)).toBe(
          '[{"a":"a","c":"c1"}]'
        );
      }).catch(fail).finally(done);
    });

  });

  describe('default functions', () => {

    const { Table } = require('../index');

    const t = new Table({
      name: 'a',
      columns: [
        { name: 'a', type: 'datetime', default: ({ sql }) => sql`now()` }
      ]
    });

    it('should insert a record', done => {
      expect(t.fill({}).Insert()).toEqual(['insert into "a" ("a") values (now())']);
      t.fillAsync({}).then(records => expect(records.Insert()).toEqual(['insert into "a" ("a") values (now())'])).catch(fail).finally(done);
    });

  });

});
