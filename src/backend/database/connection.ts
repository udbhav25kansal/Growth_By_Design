import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'metrics.db');

// Initialize database connection
export const db = new Database(DB_PATH);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Migration tracking table
const createMigrationsTable = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Check if migration has been run
const isMigrationExecuted = (migrationName: string): boolean => {
  const result = db.prepare('SELECT COUNT(*) as count FROM migrations WHERE name = ?').get(migrationName) as { count: number };
  return result.count > 0;
};

// Mark migration as executed
const markMigrationExecuted = (migrationName: string) => {
  db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
};

// Define your database schema migrations
const migrations = [
  {
    name: '001_initial_schema',
    sql: `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Metrics table
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metadata TEXT, -- JSON string for additional data
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Checks table
      CREATE TABLE IF NOT EXISTS checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        check_name TEXT NOT NULL,
        check_status TEXT NOT NULL CHECK (check_status IN ('pending', 'completed', 'failed')),
        check_data TEXT, -- JSON string for check-specific data
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
      CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON metrics(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_checks_user_id ON checks(user_id);
      CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(check_status);
      CREATE INDEX IF NOT EXISTS idx_checks_created_at ON checks(created_at);
    `
  },
  {
    name: '002_auth_and_documents',
    sql: `
      -- Add password_hash column for authentication (if it doesn't yet exist)
      ALTER TABLE users ADD COLUMN password_hash TEXT;

      -- Documents table stores file uploads linked to a user
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    `
  }
];

// Run all pending migrations
export const runMigrations = () => {
  console.log('🚀 Starting database migrations...');
  
  // Create migrations tracking table
  createMigrationsTable();
  
  // Run each migration
  migrations.forEach(migration => {
    if (!isMigrationExecuted(migration.name)) {
      console.log(`📝 Running migration: ${migration.name}`);
      
      try {
        // Execute migration in a transaction
        db.exec('BEGIN TRANSACTION');
        db.exec(migration.sql);
        markMigrationExecuted(migration.name);
        db.exec('COMMIT');
        
        console.log(`✅ Migration ${migration.name} completed successfully`);
      } catch (error) {
        db.exec('ROLLBACK');
        console.error(`❌ Migration ${migration.name} failed:`, error);
        throw error;
      }
    } else {
      console.log(`⏭️  Migration ${migration.name} already executed, skipping`);
    }
  });
  
  console.log('🎉 All migrations completed successfully!');
};

// Initialize database on module load
export const initializeDatabase = () => {
  try {
    runMigrations();
    console.log(`📊 Database initialized at: ${DB_PATH}`);
    
    // Log table counts for verification
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const metricCount = db.prepare('SELECT COUNT(*) as count FROM metrics').get() as { count: number };
    const checkCount = db.prepare('SELECT COUNT(*) as count FROM checks').get() as { count: number };
    
    console.log(`📈 Database stats - Users: ${userCount.count}, Metrics: ${metricCount.count}, Checks: ${checkCount.count}`);
    return true;
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    throw error;
  }
};

// Lazy initialization flag
let _initialized = false;

// Ensure database is initialized before any operations
const ensureInitialized = () => {
  if (!_initialized) {
    initializeDatabase();
    _initialized = true;
  }
};

// Create prepared statements factory (lazy initialization)
const createQueries = () => {
  ensureInitialized();
  
  return {
    // Users
    createUser: db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING *'),
    getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    updateUser: db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'),
    
    // Metrics
    createMetric: db.prepare('INSERT INTO metrics (user_id, metric_name, metric_value, metadata) VALUES (?, ?, ?, ?) RETURNING *'),
    getMetricsByUser: db.prepare('SELECT * FROM metrics WHERE user_id = ? ORDER BY recorded_at DESC'),
    getMetricsByName: db.prepare('SELECT * FROM metrics WHERE metric_name = ? ORDER BY recorded_at DESC'),
    
    // Checks
    createCheck: db.prepare('INSERT INTO checks (user_id, check_name, check_status, check_data) VALUES (?, ?, ?, ?) RETURNING *'),
    updateCheckStatus: db.prepare('UPDATE checks SET check_status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'),
    getChecksByUser: db.prepare('SELECT * FROM checks WHERE user_id = ? ORDER BY created_at DESC'),
    getPendingChecks: db.prepare('SELECT * FROM checks WHERE check_status = "pending" ORDER BY created_at ASC'),
  };
};

// Export queries with lazy initialization
export const queries = new Proxy({} as ReturnType<typeof createQueries>, {
  get(target, prop) {
    if (!_initialized) {
      const actualQueries = createQueries();
      // Copy all properties to target
      Object.assign(target, actualQueries);
    }
    return target[prop as keyof typeof target];
  }
});

// Graceful shutdown
process.on('exit', () => {
  db.close();
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
}); 