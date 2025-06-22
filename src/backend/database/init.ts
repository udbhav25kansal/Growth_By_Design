import { initializeDatabase } from './connection';

// This module automatically initializes the database when imported
// This ensures the database is set up before any API routes or server components try to use it

let isInitialized = false;

const initDB = () => {
  if (!isInitialized && typeof window === 'undefined') {
    // Only run on server side
    console.log('🔧 Initializing database on server startup...');
    initializeDatabase();
    isInitialized = true;
  }
};

// Initialize immediately when this module is imported
initDB();

export { initDB }; 