'use strict';

const tables = require('./tables');
const joins = require('./joins');

describe('scope tests', () => {

  describe('table tests', () => {

    describe('orders tests', () => {

      const t = tables.orders;

      it('should apply a scope to a record set', () => {
        const data = [
          {
            company: 'XFA112',
            order_id: '43f60550-561e-42ae-ab79-de26e9ac121d',
            order_date: '2019-06-13',
            customer: 'WILLO194',
            delivery: {
              name: 'Terry Willoughby',
              address: {
                company: '',
                street: '15 Danebury Street',
                locality: 'Fenchurch',
                city: 'Leeds',
                region: '',
                postalCode: 'LS2 9HG',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Willoughby',
              address: {
                company: '',
                street: '15 Danebury Street',
                locality: 'Fenchurch',
                city: 'Leeds',
                region: '',
                postalCode: 'LS2 9HG',
                country: 'GB'
              }
            }
          },
          {
            company: 'GGH194',
            order_id: '30541f82-e9d8-417d-8b27-28ab8a20166a',
            order_date: '2019-04-26',
            customer: 'LLS125',
            delivery: {
              name: 'Lillian Stretch',
              address: {
                company: 'Middlewych Industries Ltd',
                street: '17 James St',
                locality: 'Broadwich',
                city: 'Leeds',
                region: 'Yorkshire',
                postalCode: 'LS4 7GT',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Lillian Stretch',
              address: {
                company: 'Middlewych Industries Ltd',
                street: '17 James St',
                locality: 'Broadwich',
                city: 'Leeds',
                region: 'Yorkshire',
                postalCode: 'LS4 7GT',
                country: 'GB'
              }
            }
          }
        ];
        const r = t.toRecordSet(data);
        expect(JSON.stringify(r.scope({ company: 'LDF192', delivery: { address: { region: 'West Yorkshire' } } }))).toBe(
          '[{"company":"LDF192","order_id":"43f60550-561e-42ae-ab79-de26e9ac121d","order_date":"2019-06-13","customer":"WILLO194","delivery":{"name":"Terry Willoughby",' +
            '"address":{"company":"","street":"15 Danebury Street","locality":"Fenchurch","city":"Leeds","region":"West Yorkshire","postalCode":"LS2 9HG","country":"GB"}},' +
            '"invoice":{"name":"Terry Willoughby","address":{"company":"","street":"15 Danebury Street","locality":"Fenchurch","city":"Leeds","region":"","postalCode":"LS2 9HG",' +
            '"country":"GB"}}},{"company":"LDF192","order_id":"30541f82-e9d8-417d-8b27-28ab8a20166a","order_date":"2019-04-26","customer":"LLS125",' +
            '"delivery":{"name":"Lillian Stretch","address":{"company":"Middlewych Industries Ltd","street":"17 James St","locality":"Broadwich","city":"Leeds",' +
            '"region":"West Yorkshire","postalCode":"LS4 7GT","country":"GB"}},"invoice":{"name":"Lillian Stretch","address":{"company":"Middlewych Industries Ltd",' +
            '"street":"17 James St","locality":"Broadwich","city":"Leeds","region":"Yorkshire","postalCode":"LS4 7GT","country":"GB"}}}]'
        );
      });

      it('should apply a scope and defaults to a record set', () => {
        const data = [
          {
            company: 'XFA112',
            order_id: '43f60550-561e-42ae-ab79-de26e9ac121d',
            order_date: '2019-06-13',
            customer: 'WILLO194',
            delivery: {
              name: 'Terry Willoughby',
              address: {
                company: '',
                street: '15 Danebury Street',
                locality: 'Fenchurch',
                city: 'Leeds',
                region: '',
                postalCode: 'LS2 9HG',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Willoughby',
              address: {
                company: '',
                street: '15 Danebury Street',
                locality: 'Fenchurch',
                city: 'Leeds',
                region: '',
                postalCode: 'LS2 9HG',
                country: 'GB'
              }
            }
          },
          {
            company: 'GGH194',
            order_date: '2019-04-26',
            customer: 'LLS125',
            delivery: {
              name: 'Lillian Stretch',
              address: {
                company: 'Middlewych Industries Ltd',
                street: '17 James St',
                locality: 'Broadwich',
                city: 'Leeds',
                postalCode: 'LS4 7GT',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Lillian Stretch',
              address: {
                company: 'Middlewych Industries Ltd',
                street: '17 James St',
                locality: 'Broadwich',
                city: 'Leeds',
                postalCode: 'LS4 7GT',
                country: 'GB'
              }
            }
          }
        ];
        const r = t.toRecordSet(data);
        expect(JSON.stringify(r.scope(
          {
            company: 'LDF192',
            delivery: {
              address: {
                region: 'West Yorkshire'
              }
            }
          },
          {
            order_id: 'ddcf7be9-f8b8-4058-8358-658eccc18a3b',
            invoice: {
              address: { region: 'Yorkshire' }
            }
          }
        ))).toBe(
          '[{"company":"LDF192","order_id":"43f60550-561e-42ae-ab79-de26e9ac121d","order_date":"2019-06-13","customer":"WILLO194","delivery":{"name":"Terry Willoughby",' +
            '"address":{"company":"","street":"15 Danebury Street","locality":"Fenchurch","city":"Leeds","region":"West Yorkshire","postalCode":"LS2 9HG","country":"GB"}},' +
            '"invoice":{"name":"Terry Willoughby","address":{"company":"","street":"15 Danebury Street","locality":"Fenchurch","city":"Leeds","region":"",' +
            '"postalCode":"LS2 9HG","country":"GB"}}},{"company":"LDF192","order_id":"ddcf7be9-f8b8-4058-8358-658eccc18a3b","order_date":"2019-04-26","customer":"LLS125",' +
            '"delivery":{"name":"Lillian Stretch","address":{"company":"Middlewych Industries Ltd","street":"17 James St","locality":"Broadwich","city":"Leeds",' +
            '"region":"West Yorkshire","postalCode":"LS4 7GT","country":"GB"}},"invoice":{"name":"Lillian Stretch","address":{"company":"Middlewych Industries Ltd",' +
            '"street":"17 James St","locality":"Broadwich","city":"Leeds","region":"Yorkshire","postalCode":"LS4 7GT","country":"GB"}}}]'
        );
      });

      it('should prefer scope over default', () => {
        const data = [
          {
            order_id: '43f60550-561e-42ae-ab79-de26e9ac121d',
            order_date: '2019-06-13',
            customer: 'WILLO194',
            delivery: {
              name: 'Terry Willoughby',
              address: {
                company: '',
                street: '15 Danebury Street',
                locality: 'Fenchurch',
                city: 'Leeds',
                region: '',
                postalCode: 'LS2 9HG',
                country: 'GB'
              }
            },
            invoice: {
              name: 'Terry Willoughby',
              address: {
                company: '',
                street: '15 Danebury Street',
                locality: 'Fenchurch',
                city: 'Leeds',
                region: '',
                postalCode: 'LS2 9HG',
                country: 'GB'
              }
            }
          }
        ];
        const r = t.toRecordSet(data);
        expect(JSON.stringify(r.scope({ company: 'AAA001' }, { company: 'AAA002' }))).toBe(
          '[{"company":"AAA001","order_id":"43f60550-561e-42ae-ab79-de26e9ac121d","order_date":"2019-06-13","customer":"WILLO194","delivery":{"name":"Terry Willoughby",' +
            '"address":{"company":"","street":"15 Danebury Street","locality":"Fenchurch","city":"Leeds","region":"","postalCode":"LS2 9HG","country":"GB"}},' +
            '"invoice":{"name":"Terry Willoughby","address":{"company":"","street":"15 Danebury Street","locality":"Fenchurch","city":"Leeds","region":"",' +
            '"postalCode":"LS2 9HG","country":"GB"}}}]'
        );
      });

    });

  });

  describe('joins.tests', () => {

    describe('inventory2 tests', () => {

      const j = joins.inventory2;

      it('should scope records for inventory2', () => {
        const data = [
          {
            company: 'ANA191',
            sku: 'DX676',
            description: 'Hammer',
            warehouse: {
              company: 'ANA191',
              name: 'Chesterfield',
              description: 'grotty',
              address: {
                company: 'Tools 4 U Ltd',
                street: '29 Sudbury Lane',
                locality: '',
                city: 'Chesterfield',
                region: 'Derbyshire',
                postalCode: 'S40 9DS',
                country: 'GB'
              },
              bins: {
                company: 'ANA191',
                warehouse_name: 'Chesterfield',
                bin: 'FA76D2',
                inventory: {
                  sku: 'DX676',
                  bin: 'FA76D2',
                  time: '2019-06-14 09:12:54',
                  qty: 5,
                  cost: 98.34
                }
              }
            }
          },
          {
            company: 'ANA191',
            sku: 'DX676',
            description: 'Hammer',
            warehouse: {
              company: 'ANA191',
              name: 'Chesterfield',
              description: 'grotty',
              address: {
                company: 'Tools 4 U Ltd',
                street: '29 Sudbury Lane',
                locality: '',
                city: 'Chesterfield',
                region: 'Derbyshire',
                postalCode: 'S40 9DS',
                country: 'GB'
              },
              bins: {
                warehouse_name: 'Chesterfield',
                company: 'ANA191',
                warehouse_name: 'Chesterfield',
                bin: 'GA15A3',
                inventory: {
                  sku: 'DX676',
                  bin: 'GA15A3',
                  time: '2019-04-30 11:32:19',
                  qty: 20,
                  cost: 96.41
                }
              }
            }
          },
          {
            company: 'ANA191',
            sku: 'DX676',
            description: 'Hammer',
            warehouse: {
              company: 'ANA191',
              name: 'Chesterfield',
              description: 'grotty',
              address: {
                company: 'Tools 4 U Ltd',
                street: '29 Sudbury Lane',
                locality: '',
                city: 'Chesterfield',
                region: 'Derbyshire',
                postalCode: 'S40 9DS',
                country: 'GB'
              },
              bins: {
                company: 'ANA191',
                warehouse_name: 'Chesterfield',
                bin: 'FA76D2',
                inventory: {
                  sku: 'DX676',
                  bin: 'FA76D2',
                  time: '2019-07-16 13:16:29',
                  qty: 40,
                  cost: 95.32
                }
              }
            }
          },
          {
            company: 'ANA191',
            sku: 'DX676',
            description: 'Hammer',
            warehouse: {
              company: 'ANA191',
              name: 'Chesterfield',
              description: 'grotty',
              address: {
                company: 'Tools 4 U Ltd',
                street: '29 Sudbury Lane',
                locality: '',
                city: 'Chesterfield',
                region: 'Derbyshire',
                postalCode: 'S40 9DS',
                country: 'GB'
              },
              bins: {
                company: 'ANA191',
                warehouse_name: 'Chesterfield',
                bin: 'FA76D2',
                inventory: {
                  sku: 'DX676',
                  bin: 'FA76D2',
                  time: '2019-06-14 09:12:54',
                  qty: 5,
                  cost: 98.34
                }
              }
            }
          },
          {
            company: 'ANA191',
            sku: 'DX676',
            description: 'Hammer',
            warehouse: {
              company: 'ANA191',
              name: 'Wolverhampton',
              description: 'even grottier',
              address: {
                company: 'Hammer Time Ltd',
                street: '45 Strawberry St',
                locality: '',
                city: 'Wolverhampton',
                region: 'West Midlands',
                postalCode: 'WV17 9JK',
                country: 'GB'
              },
              bins: {
                company: 'ANA191',
                warehouse_name: 'Wolverhampton',
                bin: 'J16X',
                inventory: {
                  sku: 'DX676',
                  bin: 'J16X',
                  time: '2020-02-12 08:55:19',
                  qty: 200,
                  cost: 84.96
                }
              }
            }
          },
          {
            company: 'ANA191',
            sku: 'DX678',
            description: 'Chisel',
            warehouse: {
              company: 'ANA191',
              name: 'Telford',
              description: 'quite nice but small',
              address: {
                company: 'Chisels Unlimited Ltd',
                street: '16 Shrewsbury St',
                locality: 'Victoria Business Park',
                city: 'Telford',
                region: 'Shropshire',
                postalCode: 'TF2 8XD',
                country: 'GB'
              },
              bins: {
                company: 'ANA191',
                warehouse_name: 'Telford',
                inventory: []
              }
            }
          }
        ];
        const r = j.toRecordSet(data);
        expect(JSON.stringify(r.scope({ company: 'FFJ121', warehouse: { name: 'Wallborough' } }, { warehouse: { bins: { bin: 'A19D' } } }))).toBe(
          '[{"company":"FFJ121","sku":"DX676","description":"Hammer","warehouse":[{"company":"FFJ121","name":"Wallborough","description":"grotty",' +
            '"address":{"company":"Tools 4 U Ltd","street":"29 Sudbury Lane","locality":"","city":"Chesterfield","region":"Derbyshire","postalCode":"S40 9DS",' +
            '"country":"GB"},"bins":[{"company":"FFJ121","warehouse_name":"Wallborough","bin":"FA76D2","inventory":[{"company":"FFJ121","sku":"DX676",' +
            '"warehouse_name":"Wallborough","bin":"FA76D2","time":"2019-06-14 09:12:54","qty":5,"cost":98.34},{"company":"FFJ121","sku":"DX676","warehouse_name":"Wallborough",' +
            '"bin":"FA76D2","time":"2019-07-16 13:16:29","qty":40,"cost":95.32}]},{"company":"FFJ121","warehouse_name":"Wallborough","bin":"GA15A3",' +
            '"inventory":[{"company":"FFJ121","sku":"DX676","warehouse_name":"Wallborough","bin":"GA15A3","time":"2019-04-30 11:32:19","qty":20,"cost":96.41}]}]},' +
            '{"company":"FFJ121","name":"Wallborough","description":"even grottier","address":{"company":"Hammer Time Ltd","street":"45 Strawberry St","locality":"",' +
            '"city":"Wolverhampton","region":"West Midlands","postalCode":"WV17 9JK","country":"GB"},"bins":[{"company":"FFJ121","warehouse_name":"Wallborough","bin":"J16X",' +
            '"inventory":[{"company":"FFJ121","sku":"DX676","warehouse_name":"Wallborough","bin":"J16X","time":"2020-02-12 08:55:19","qty":200,"cost":84.96}]}]}]},' +
            '{"company":"FFJ121","sku":"DX678","description":"Chisel","warehouse":[{"company":"FFJ121","name":"Wallborough","description":"quite nice but small",' +
            '"address":{"company":"Chisels Unlimited Ltd","street":"16 Shrewsbury St","locality":"Victoria Business Park","city":"Telford","region":"Shropshire",' +
            '"postalCode":"TF2 8XD","country":"GB"},"bins":[{"company":"FFJ121","warehouse_name":"Wallborough","bin":"A19D","inventory":[]}]}]}]'
        );
      });

    });

  });

});
