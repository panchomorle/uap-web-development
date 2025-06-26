import { database } from './connection';
import fs from 'fs';
import path from 'path';

export class Migrator {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(__dirname, 'migrations');
    this.ensureMigrationsDir();
    // Remover la llamada asíncrona del constructor
  }

  private ensureMigrationsDir(): void {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }
  }

  private async ensureMigrationsTable(): Promise<void> {
    await database.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async runMigrations(): Promise<void> {
    console.log('🔍 Checking for migrations...');
    
    // Asegurar que la tabla de migraciones existe antes de usarla
    await this.ensureMigrationsTable();
    
    const files = this.getMigrationFiles();
    
    if (files.length === 0) {
      console.log('📝 No migration files found');
      return;
    }

    for (const file of files) {
      const alreadyExecuted = await this.isMigrationExecuted(file);
      if (!alreadyExecuted) {
        console.log(`⚡ Running migration: ${file}`);
        await this.runSingleMigration(file);
        console.log(`✅ Completed: ${file}`);
      } else {
        console.log(`⏭️ Skipping (already executed): ${file}`);
      }
    }
    
    console.log('🎉 All migrations completed!');
  }

  private getMigrationFiles(): string[] {
    return fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.includes('.rollback.'))
      .sort(); // Importante: orden alfabético por timestamp
  }

  private async isMigrationExecuted(filename: string): Promise<boolean> {
    const result = await database.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM migrations WHERE filename = ?',
      [filename]
    );
    return (result?.count || 0) > 0;
  }

  private async runSingleMigration(filename: string): Promise<void> {
    const filePath = path.join(this.migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Ejecutar el SQL (puede contener múltiples statements)
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await database.run(statement.trim());
        }
      }
      
      // Marcar como ejecutada
      await database.run(
        'INSERT INTO migrations (filename) VALUES (?)',
        [filename]
      );
    } catch (error) {
      console.error(`❌ Error running migration ${filename}:`, error);
      throw error;
    }
  }

  async rollbackLastMigration(): Promise<void> {
    const lastMigration = await database.get<{ filename: string }>(
      'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1'
    );
    
    if (!lastMigration) {
      console.log('📝 No migrations to rollback');
      return;
    }
    
    console.log(`🔄 Rolling back migration: ${lastMigration.filename}`);
    
    // Buscar archivo de rollback
    const rollbackFile = lastMigration.filename.replace('.sql', '.rollback.sql');
    const rollbackPath = path.join(this.migrationsDir, rollbackFile);
    
    if (fs.existsSync(rollbackPath)) {
      const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');
      const statements = rollbackSql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await database.run(statement.trim());
        }
      }
      
      // Remover de la tabla de migraciones
      await database.run(
        'DELETE FROM migrations WHERE filename = ?',
        [lastMigration.filename]
      );
      
      console.log(`✅ Rollback completed: ${lastMigration.filename}`);
    } else {
      console.log(`⚠️ No rollback file found for: ${lastMigration.filename}`);
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    const results = await database.all<{ filename: string }>(
      'SELECT filename FROM migrations ORDER BY executed_at ASC'
    );
    return results.map(r => r.filename);
  }
}