import sqlite3 from "sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

class Database {
    private db: sqlite3.Database;
  
    constructor() {
      const dbPath = path.join(__dirname, "database.db");
      this.db = new sqlite3.Database(dbPath);
    }
  
    // Método separado para inicializar con migraciones
    async initialize(): Promise<void> {
      // Ejecutar migraciones automáticamente si está habilitado
      if (process.env.AUTO_MIGRATE === "true") {
        console.log("🔄 Auto-migrate enabled, running migrations...");
        // Importación dinámica para evitar dependencia circular
        const { Migrator } = await import("./migrator");
        const migrator = new Migrator();
        try {
          await migrator.runMigrations();
          console.log("✅ Auto-migrations completed successfully");
        } catch (error) {
          console.error("❌ Error running auto-migrations:", error);
        }
      }
    }
  
    async run(sql: string, params: any[] = []): Promise<void> {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  
    async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row as T);
        });
      });
    }
  
    async all<T>(sql: string, params: any[] = []): Promise<T[]> {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows as T[]);
        });
      });
    }
  
    close(): void {
      this.db.close();
    }
  }
  
  export const database = new Database();