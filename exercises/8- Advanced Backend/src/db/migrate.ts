#!/usr/bin/env tsx
import { Migrator } from './migrator';
import { database } from './connection';

async function main() {
  const command = process.argv[2];
  const migrator = new Migrator();

  try {
    switch (command) {
      case 'up':
        console.log('🚀 Running migrations...');
        await migrator.runMigrations();
        break;
      
      case 'rollback':
        console.log('🔄 Rolling back last migration...');
        await migrator.rollbackLastMigration();
        break;
      
      case 'status':
        console.log('📊 Migration status:');
        const executed = await migrator.getExecutedMigrations();
        if (executed.length === 0) {
          console.log('  No migrations executed yet');
        } else {
          console.log('  Executed migrations:');
          executed.forEach(migration => {
            console.log(`    ✅ ${migration}`);
          });
        }
        break;
      
      case 'reset':
        console.log('🔥 Resetting database...');
        await database.run('DROP TABLE IF EXISTS permissions');
        await database.run('DROP TABLE IF EXISTS tasks');
        await database.run('DROP TABLE IF EXISTS boards');
        await database.run('DROP TABLE IF EXISTS users');
        await database.run('DROP TABLE IF EXISTS migrations');
        console.log('✅ Database reset completed');
        break;
      
      default:
        console.log(`
Usage: npm run migrate <command>

Commands:
  up       - Run all pending migrations
  rollback - Rollback the last migration
  status   - Show migration status
  reset    - Reset database (drops all tables)

Examples:
  npm run migrate up
  npm run migrate status
  npm run migrate rollback
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    database.close();
  }
}

main();