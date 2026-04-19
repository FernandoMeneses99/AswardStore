/**
 * Database Configuration Module
 * Centralized connection pool management using node-postgres (pg)
 * 
 * Features:
 * - Connection pooling for performance
 * - Environment-based configuration
 * - Connection retry logic
 * - Error handling
 * - Query timeout protection
 */

require('dotenv').config();

const { Pool } = require('pg');
const crypto = require('crypto');

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 2000;
  }

  /**
   * Initialize the connection pool
   * Reads configuration from environment variables
   */
  async connect() {
    if (this.pool) {
      return this.pool;
    }

    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'asward_store',
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000'),
    };

    // Validate required configuration
    if (!config.password) {
      throw new Error('Database password is required. Set DB_PASSWORD environment variable.');
    }

    console.log(`[DB] Connecting to ${config.host}:${config.port}/${config.database}...`);

    this.pool = new Pool(config);

    // Test the connection
    try {
      const client = await this.pool.connect();
      console.log('[DB] ✓ Connection established');
      
      // Configure query timeout
      client.query('SET statement_timeout = $1', ['30000']);
      
      client.release();
      this.isConnected = true;
      this.retryCount = 0;
    } catch (error) {
      console.error('[DB] ✗ Connection failed:', error.message);
      this.isConnected = false;
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`[DB] Retry ${this.retryCount}/${this.maxRetries} in ${this.retryDelay}ms...`);
        await this.sleep(this.retryDelay);
        this.retryDelay *= 2; // Exponential backoff
        return this.connect();
      }
      
      throw new Error(`Failed to connect to database after ${this.maxRetries} attempts: ${error.message}`);
    }

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('[DB] Pool error:', err.message);
      this.isConnected = false;
    });

    return this.pool;
  }

  /**
   * Execute a query with parameters (SQL injection protection)
   * @param {string} text - SQL query with $1, $2, etc. placeholders
   * @param {Array} params - Array of parameters
   * @returns {Promise<Object>} Query result
   */
  async query(text, params = []) {
    if (!this.pool) {
      await this.connect();
    }

    const start = Date.now();
    
    try {
      // Validate inputs
      if (typeof text !== 'string' || text.trim() === '') {
        throw new Error('Query text must be a non-empty string');
      }
      
      if (!Array.isArray(params)) {
        throw new Error('Params must be an array');
      }

      const result = await this.pool.query(text, params);
      
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.log(`[DB] Slow query (${duration}ms): ${text.substring(0, 100)}...`);
      }

      return result;
    } catch (error) {
      // Log without exposing sensitive data
      console.error('[DB] Query error:', error.message);
      throw error;
    }
  }

  /**
   * Execute a transaction
   * @param {Function} callback - Function receiving client as parameter
   */
  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool for direct manipulation
   */
  async getClient() {
    if (!this.pool) {
      await this.connect();
    }
    return this.pool.connect();
  }

  /**
   * Check if database is connected
   */
  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close all connections
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('[DB] ✓ Disconnected');
    }
  }

  /**
   * Utility: sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const db = new Database();

module.exports = {
  db,
  query: (...args) => db.query(...args),
  transaction: (...args) => db.transaction(...args),
  getClient: (...args) => db.getClient(...args),
  connect: () => db.connect(),
  disconnect: () => db.disconnect(),
  healthCheck: () => db.healthCheck(),
};

// Export for use in other modules
module.exports.default = db;