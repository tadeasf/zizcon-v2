import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export enum ApiSource {
  NEXTJS_API = 'NEXTJS_API',
  AUTH0_SDK = 'AUTH0_SDK',
  AUTH0_MGMT_API = 'AUTH0_MGMT_API',
  DIRECTUS_SDK = 'DIRECTUS_SDK'
}

export class ApiTrackingService {
  private static instance: ApiTrackingService;
  private db: Database | null = null;
  private readonly dbPath: string;

  private constructor() {
    // Use data directory in project root
    this.dbPath = path.join(process.cwd(), 'data', 'api-calls.db');
  }

  public static async getInstance(): Promise<ApiTrackingService> {
    if (!ApiTrackingService.instance) {
      ApiTrackingService.instance = new ApiTrackingService();
      await ApiTrackingService.instance.initializeDb();
    }
    return ApiTrackingService.instance;
  }

  private async initializeDb() {
    try {
      // Ensure the data directory exists
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Initialize the database with WAL mode for better concurrent access
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Enable WAL mode and set busy timeout
      await this.db.exec('PRAGMA journal_mode = WAL;');
      await this.db.exec('PRAGMA busy_timeout = 5000;');

      // Create the table if it doesn't exist
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS api_calls (
          id TEXT PRIMARY KEY,
          timestamp INTEGER NOT NULL,
          api_source TEXT NOT NULL
        )
      `);

      console.log('API tracking database initialized:', {
        path: this.dbPath,
        exists: await fs.access(this.dbPath).then(() => true).catch(() => false)
      });
    } catch (error) {
      console.error('Failed to initialize API tracking database:', error);
      // Don't throw, just log the error and continue without tracking
      this.db = null;
    }
  }

  public async trackApiCall(source: ApiSource): Promise<void> {
    if (!this.db) {
      console.warn('API tracking disabled - database not initialized');
      return;
    }

    try {
      const id = uuidv4();
      const timestamp = Date.now();

      await this.db.run(
        'INSERT INTO api_calls (id, timestamp, api_source) VALUES (?, ?, ?)',
        [id, timestamp, source]
      );

      console.log('API Call tracked:', {
        id,
        timestamp: new Date(timestamp).toISOString(),
        source
      });
    } catch (error) {
      console.error('Failed to track API call:', error);
      // Don't throw, just log the error and continue
    }
  }
} 