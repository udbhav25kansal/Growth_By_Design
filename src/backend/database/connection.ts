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
  },
  {
    name: '003_problem_framing_agents',
    sql: `
      -- Insert default user for testing if not exists
      INSERT OR IGNORE INTO users (id, email, name, password_hash) 
      VALUES (1, 'test@example.com', 'Test User', 'test_hash');
      
      -- Problem Framing Sessions: Each analysis session by a user
      CREATE TABLE IF NOT EXISTS problem_framing_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_name TEXT, -- Optional name given by user
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Uploaded Files: Store file metadata and content for each agent
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        agent_type TEXT NOT NULL CHECK (agent_type IN ('crm_data', 'customer_interaction', 'product_analytics')),
        original_filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL, -- MIME type
        file_extension TEXT NOT NULL, -- .pdf, .docx, etc.
        file_path TEXT, -- Physical file storage path (optional)
        extracted_text TEXT NOT NULL, -- Raw extracted text from file
        text_length INTEGER NOT NULL, -- Length of extracted text
        upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT, -- JSON for additional file metadata
        FOREIGN KEY (session_id) REFERENCES problem_framing_sessions (id) ON DELETE CASCADE
      );

      -- AI Analysis Results: Store structured AI responses
      CREATE TABLE IF NOT EXISTS ai_analysis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER NOT NULL,
        agent_type TEXT NOT NULL CHECK (agent_type IN ('crm_data', 'customer_interaction', 'product_analytics')),
        model_used TEXT NOT NULL, -- gpt-4o, gpt-4, etc.
        prompt_version TEXT, -- Track prompt versions for analysis evolution
        
        -- Raw AI response
        raw_response TEXT NOT NULL,
        
        -- Structured analysis fields (extracted from AI response)
        core_problem TEXT,
        root_causes TEXT, -- JSON array of root causes
        primary_recommendation TEXT,
        most_affected_segment TEXT, -- For customer interaction
        most_affected_stage TEXT, -- For product analytics
        key_metrics_to_track TEXT, -- JSON array for product analytics
        supporting_evidence TEXT,
        
        -- Analysis metadata
        analysis_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        processing_time_ms INTEGER, -- Time taken for AI analysis
        token_usage TEXT, -- JSON with prompt/completion tokens
        confidence_score REAL, -- Optional confidence score
        
        -- Quality and review
        user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5), -- User feedback on analysis quality
        user_notes TEXT, -- User's notes on the analysis
        reviewed_at DATETIME,
        
        FOREIGN KEY (file_id) REFERENCES uploaded_files (id) ON DELETE CASCADE
      );

      -- Problem Patterns: Track recurring problems across analyses
      CREATE TABLE IF NOT EXISTS problem_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        pattern_name TEXT NOT NULL,
        pattern_description TEXT,
        first_identified DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        occurrence_count INTEGER DEFAULT 1,
        severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
        related_analyses TEXT, -- JSON array of analysis IDs that identified this pattern
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Analysis Tags: For categorizing and searching analyses
      CREATE TABLE IF NOT EXISTS analysis_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        analysis_id INTEGER NOT NULL,
        tag_name TEXT NOT NULL,
        tag_category TEXT, -- 'industry', 'problem_type', 'urgency', etc.
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (analysis_id) REFERENCES ai_analysis_results (id) ON DELETE CASCADE
      );

      -- Create indexes for optimal performance
      CREATE INDEX IF NOT EXISTS idx_pf_sessions_user_id ON problem_framing_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_pf_sessions_created_at ON problem_framing_sessions(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_session_id ON uploaded_files(session_id);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_agent_type ON uploaded_files(agent_type);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_upload_timestamp ON uploaded_files(upload_timestamp);
      
      CREATE INDEX IF NOT EXISTS idx_ai_results_file_id ON ai_analysis_results(file_id);
      CREATE INDEX IF NOT EXISTS idx_ai_results_agent_type ON ai_analysis_results(agent_type);
      CREATE INDEX IF NOT EXISTS idx_ai_results_analysis_timestamp ON ai_analysis_results(analysis_timestamp);
      CREATE INDEX IF NOT EXISTS idx_ai_results_model_used ON ai_analysis_results(model_used);
      
      CREATE INDEX IF NOT EXISTS idx_problem_patterns_user_id ON problem_patterns(user_id);
      CREATE INDEX IF NOT EXISTS idx_problem_patterns_status ON problem_patterns(status);
      CREATE INDEX IF NOT EXISTS idx_problem_patterns_severity ON problem_patterns(severity_level);
      
      CREATE INDEX IF NOT EXISTS idx_analysis_tags_analysis_id ON analysis_tags(analysis_id);
      CREATE INDEX IF NOT EXISTS idx_analysis_tags_tag_name ON analysis_tags(tag_name);
      CREATE INDEX IF NOT EXISTS idx_analysis_tags_category ON analysis_tags(tag_category);
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
    getPendingChecks: db.prepare("SELECT * FROM checks WHERE check_status = 'pending' ORDER BY created_at ASC"),

    // Problem Framing Sessions
    createSession: db.prepare('INSERT INTO problem_framing_sessions (user_id, session_name) VALUES (?, ?) RETURNING *'),
    getSessionsByUser: db.prepare('SELECT * FROM problem_framing_sessions WHERE user_id = ? ORDER BY created_at DESC'),
    getSessionById: db.prepare('SELECT * FROM problem_framing_sessions WHERE id = ?'),
    updateSession: db.prepare('UPDATE problem_framing_sessions SET session_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'),

    // Uploaded Files
    createUploadedFile: db.prepare(`
      INSERT INTO uploaded_files 
      (session_id, agent_type, original_filename, file_size, file_type, file_extension, file_path, extracted_text, text_length, metadata) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `),
    getFilesBySession: db.prepare('SELECT * FROM uploaded_files WHERE session_id = ? ORDER BY upload_timestamp DESC'),
    getFilesByAgent: db.prepare('SELECT * FROM uploaded_files WHERE agent_type = ? ORDER BY upload_timestamp DESC'),
    getFileById: db.prepare('SELECT * FROM uploaded_files WHERE id = ?'),

    // AI Analysis Results
    createAnalysisResult: db.prepare(`
      INSERT INTO ai_analysis_results 
      (file_id, agent_type, model_used, prompt_version, raw_response, core_problem, root_causes, primary_recommendation, 
       most_affected_segment, most_affected_stage, key_metrics_to_track, supporting_evidence, processing_time_ms, token_usage, confidence_score) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `),
    getAnalysisByFileId: db.prepare('SELECT * FROM ai_analysis_results WHERE file_id = ?'),
    getAnalysesByUser: db.prepare(`
      SELECT ar.*, uf.original_filename, uf.agent_type as file_agent_type, pfs.session_name 
      FROM ai_analysis_results ar 
      JOIN uploaded_files uf ON ar.file_id = uf.id 
      JOIN problem_framing_sessions pfs ON uf.session_id = pfs.id 
      WHERE pfs.user_id = ? 
      ORDER BY ar.analysis_timestamp DESC
    `),
    getAnalysesByAgent: db.prepare('SELECT * FROM ai_analysis_results WHERE agent_type = ? ORDER BY analysis_timestamp DESC'),
    updateAnalysisRating: db.prepare('UPDATE ai_analysis_results SET user_rating = ?, user_notes = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?'),

    // Problem Patterns
    createProblemPattern: db.prepare(`
      INSERT INTO problem_patterns 
      (user_id, pattern_name, pattern_description, severity_level, status, related_analyses) 
      VALUES (?, ?, ?, ?, ?, ?) RETURNING *
    `),
    getPatternsByUser: db.prepare('SELECT * FROM problem_patterns WHERE user_id = ? ORDER BY last_seen DESC'),
    updatePatternOccurrence: db.prepare(`
      UPDATE problem_patterns 
      SET occurrence_count = occurrence_count + 1, last_seen = CURRENT_TIMESTAMP, related_analyses = ? 
      WHERE id = ? RETURNING *
    `),
    updatePatternStatus: db.prepare('UPDATE problem_patterns SET status = ? WHERE id = ? RETURNING *'),

    // Analysis Tags
    createAnalysisTag: db.prepare('INSERT INTO analysis_tags (analysis_id, tag_name, tag_category) VALUES (?, ?, ?) RETURNING *'),
    getTagsByAnalysis: db.prepare('SELECT * FROM analysis_tags WHERE analysis_id = ?'),
    getAnalysesByTag: db.prepare(`
      SELECT ar.*, uf.original_filename, pfs.session_name 
      FROM ai_analysis_results ar 
      JOIN uploaded_files uf ON ar.file_id = uf.id 
      JOIN problem_framing_sessions pfs ON uf.session_id = pfs.id 
      JOIN analysis_tags at ON ar.id = at.analysis_id 
      WHERE at.tag_name = ? 
      ORDER BY ar.analysis_timestamp DESC
    `),
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