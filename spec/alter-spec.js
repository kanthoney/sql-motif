'use strict';

const { Table } = require('../index');
const types = require('./types');
const tables = require('./tables');

describe('alter tests', () => {

  describe('order tests', () => {

    const table = tables.orders;

    it('should rename column from created_date to order_date', () => {
      expect(table.RenameColumn('created_date', 'order_date')).toBe(
        'alter table "s1"."orders" rename column "created_date" to "order_date"'
      );
    });

    it('should rename column from created_date to order_date', () => {
      expect(table.AddPrimaryKey()).toBe(
        'alter table "s1"."orders" add primary key("company", "order_id")'
      );
    });

    it('should change column delivery_name', () => {
      expect(table.ChangeColumn('delivery_name')).toBe(
        'alter table "s1"."orders" alter "delivery_name" type varchar(35) not null default \'\''
      );
    });

    it('should drop column delivery_name', () => {
      expect(table.DropColumn('delivery_name')).toBe(
        'alter table "s1"."orders" drop column "delivery_name"'
      );
    });

    it('should add column invoice_name', () => {
      expect(table.AddColumn('invoice_name')).toBe(
        'alter table "s1"."orders" add column "billing_name" varchar(35) not null default \'\''
      );
    });

    it('should rename table from sales_orders', () => {
      expect(table.Rename('sales_orders')).toBe('alter table "s1"."sales_orders" rename to "orders"');
    });

    it('should rename table from sales_orders in the s2 schema', () => {
      expect(table.Rename('sales_orders', 's2')).toBe('alter table "s2"."sales_orders" rename to "orders"');
    });

    it('should add an index', () => {
      expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' })).toBe(
        'alter table "s1"."orders" add index "delivery_name_idx"("company", "delivery_name")'
      );
    });

  });

  describe('dialects tests', () => {

    describe('mysql tests', () => {

      const table = new Table({
        dialect: 'mysql',
        types,
        schema: 's1',
        name: 'orders',
        columns: [
          { name: 'company', type: 'account', primaryKey: true, notNull: true },
          { name: 'order_id', type: 'primaryId' },
          { name: 'order_date', type: 'date' },
          { name: 'customer', type: 'account' },
          { name: 'delivery', type: 'contact' },
          { name: 'billing', type: 'contact', alias: 'invoice' }
        ]
      });

      it('should rename column from created_date to order_date', () => {
        expect(table.RenameColumn('created_date', 'order_date')).toBe(
          'alter table `s1`.`orders` change column `created_date` `order_date` date'
        );
      });
      
      it('should rename column from created_date to order_date', () => {
        expect(table.AddPrimaryKey()).toBe(
          'alter table `s1`.`orders` add primary key(`company`, `order_id`)'
        );
      });
      
      it('should change column delivery_name', () => {
        expect(table.ChangeColumn('delivery_name')).toBe(
          'alter table `s1`.`orders` modify column `delivery_name` varchar(35) not null default \'\''
        );
      });
      
      it('should drop column delivery_name', () => {
        expect(table.DropColumn('delivery_name')).toBe(
          'alter table `s1`.`orders` drop column `delivery_name`'
        );
      });
      
      it('should add column invoice_name', () => {
        expect(table.AddColumn('invoice_name')).toBe(
          'alter table `s1`.`orders` add column `billing_name` varchar(35) not null default \'\''
        );
      });
      
      it('should rename table from sales_orders', () => {
        expect(table.Rename('sales_orders')).toBe('alter table `s1`.`sales_orders` rename to `s1`.`orders`');
      });
      
      it('should rename table from sales_orders in the s2 schema', () => {
        expect(table.Rename('sales_orders', { schema: 's2' })).toBe('alter table `s2`.`sales_orders` rename to `s1`.`orders`');
      });
      
      it('should add an index', () => {
        expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' })).toBe(
          'alter table `s1`.`orders` add index `delivery_name_idx`(`company`, `delivery_name`)'
        );
      });

      it('should add an index', () => {
        expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' }, { ignore: true })).toBe(
          'alter table ignore `s1`.`orders` add index `delivery_name_idx`(`company`, `delivery_name`)'
        );
      });
      
      describe('ignore tests', () => {

        it('should rename column from created_date to order_date', () => {
          expect(table.RenameColumn('created_date', 'order_date', { ignore: true })).toBe(
            'alter table ignore `s1`.`orders` change column `created_date` `order_date` date'
          );
        });
        
        it('should change column delivery_name', () => {
          expect(table.ChangeColumn('delivery_name', { ignore: true })).toBe(
            'alter table ignore `s1`.`orders` modify column `delivery_name` varchar(35) not null default \'\''
          );
        });
        
        it('should drop column delivery_name', () => {
          expect(table.DropColumn('delivery_name', { ignore: true })).toBe(
            'alter table ignore `s1`.`orders` drop column `delivery_name`'
          );
        });
        
        it('should add column invoice_name', () => {
          expect(table.AddColumn('invoice_name', { ignore: true })).toBe(
            'alter table ignore `s1`.`orders` add column `billing_name` varchar(35) not null default \'\''
          );
        });
        
        it('should rename table from sales_orders', () => {
          expect(table.Rename('sales_orders', { ignore: true })).toBe('alter table ignore `s1`.`sales_orders` rename to `s1`.`orders`');
        });
        
        it('should rename table from sales_orders in the s2 schema', () => {
          expect(table.Rename('sales_orders', { schema: 's2', ignore: true })).toBe('alter table ignore `s2`.`sales_orders` rename to `s1`.`orders`');
        });
        
        it('should add an index', () => {
          expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' }, { ignore: true })).toBe(
            'alter table ignore `s1`.`orders` add index `delivery_name_idx`(`company`, `delivery_name`)'
          );
        });
        
      });

    });
    
    describe('postgresql tests', () => {

      const table = new Table({
        dialect: 'postgres',
        types,
        schema: 's1',
        name: 'orders',
        columns: [
          { name: 'company', type: 'account', primaryKey: true, notNull: true },
          { name: 'order_id', type: 'primaryId' },
          { name: 'order_date', type: 'date' },
          { name: 'customer', type: 'account' },
          { name: 'delivery', type: 'contact' },
          { name: 'billing', type: 'contact', alias: 'invoice' }
        ]
      });

      it('should rename column from created_date to order_date', () => {
        expect(table.RenameColumn('created_date', 'order_date')).toBe(
          'alter table "s1"."orders" rename column "created_date" to "order_date"'
        );
      });
      
      it('should rename column from created_date to order_date', () => {
        expect(table.AddPrimaryKey()).toBe(
          'alter table "s1"."orders" add primary key("company", "order_id")'
        );
      });
      
      it('should change column delivery_name', () => {
        expect(table.ChangeColumn('delivery_name')).toBe(
          'alter table "s1"."orders" alter "delivery_name" type varchar(35) not null default \'\''
        );
      });
      
      it('should drop column delivery_name', () => {
        expect(table.DropColumn('delivery_name')).toBe(
          'alter table "s1"."orders" drop column "delivery_name"'
        );
      });
      
      it('should add column invoice_name', () => {
        expect(table.AddColumn('invoice_name')).toBe(
          'alter table "s1"."orders" add column "billing_name" varchar(35) not null default \'\''
        );
      });
      
      it('should rename table from sales_orders', () => {
        expect(table.Rename('sales_orders')).toBe('alter table "s1"."sales_orders" rename to "orders"');
      });
      
      it('should rename table from sales_orders in the s2 schema', () => {
        expect(table.Rename('sales_orders', { schema: 's2' })).toEqual(
          ['alter table "s2"."sales_orders" set schema "s1"', 'alter table "s1"."sales_orders" rename to "orders"']
        );
      });
      
      it('should add an index', () => {
        expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' })).toBe(
          'create index "delivery_name_idx" on "s1"."orders"("company", "delivery_name")'
        );
      });

      it('should add an index', () => {
        expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' }, { ignore: true })).toBe(
          'create index if not exists "delivery_name_idx" on "s1"."orders"("company", "delivery_name")'
        );
      });

      describe('ignore tests', () => {

        it('should rename column from created_date to order_date', () => {
          expect(table.RenameColumn('created_date', 'order_date', { ignore: true })).toBe(
            'alter table if exists "s1"."orders" rename column "created_date" to "order_date"'
          );
        });
        
        it('should change column delivery_name', () => {
          expect(table.ChangeColumn('delivery_name', { ignore: true })).toBe(
            'alter table if exists "s1"."orders" alter "delivery_name" type varchar(35) not null default \'\''
          );
        });
        
        it('should drop column delivery_name', () => {
          expect(table.DropColumn('delivery_name', { ignore: true })).toBe(
            'alter table if exists "s1"."orders" drop column "delivery_name"'
          );
        });
        
        it('should add column invoice_name', () => {
          expect(table.AddColumn('invoice_name', { ignore: true })).toBe(
            'alter table if exists "s1"."orders" add column "billing_name" varchar(35) not null default \'\''
          );
        });
        
        it('should rename table from sales_orders', () => {
          expect(table.Rename('sales_orders', { ignore: true })).toBe('alter table if exists "s1"."sales_orders" rename to "orders"');
        });
        
        it('should rename table from sales_orders in the s2 schema', () => {
          expect(table.Rename('sales_orders', { schema: 's2', ignore: true })).toEqual(
            ['alter table if exists "s2"."sales_orders" set schema "s1"', 'alter table if exists "s1"."sales_orders" rename to "orders"']
          );
        });
        
        it('should add an index', () => {
          expect(table.AddIndex({ columns: ['company', 'delivery_name'], name: 'delivery_name_idx' }, { ignore: true })).toBe(
            'create index if not exists "delivery_name_idx" on "s1"."orders"("company", "delivery_name")'
          );
        });
                
      });
      
    });

  });

});
