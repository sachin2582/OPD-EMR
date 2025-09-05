const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.maxRetries = 5;
    this.retryDelay = 100; // Start with 100ms delay
    this.maxRetryDelay = 2000; // Max 2 seconds delay
  }

  // Connect to database with retry logic
  async connect() {
    return new Promise((resolve, reject) => {
      const attemptConnection = (retryCount = 0) => {
        this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE, (err) => {
          if (err) {
            if (err.code === 'SQLITE_BUSY' && retryCount < this.maxRetries) {
              console.log(`⚠️  Database busy, retrying in ${this.retryDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
              setTimeout(() => {
                this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
                attemptConnection(retryCount + 1);
              }, this.retryDelay);
            } else {
              console.error('❌ Database connection failed:', err.message);
              reject(err);
            }
          } else {
            console.log('✅ Database connected successfully');
            this.setupDatabase();
            resolve(this.db);
          }
        });
      };
      
      attemptConnection();
    });
  }

  // Setup database with proper configuration
  setupDatabase() {
    if (!this.db) return;

    // Set WAL mode for better concurrency
    this.db.run('PRAGMA journal_mode=WAL');
    
    // Set busy timeout to 30 seconds
    this.db.run('PRAGMA busy_timeout=30000');
    
    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys=ON');
    
    // Set synchronous mode for better performance
    this.db.run('PRAGMA synchronous=NORMAL');
  }

  // Execute query with retry logic
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      const attemptQuery = (retryCount = 0) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            if (err.code === 'SQLITE_BUSY' && retryCount < this.maxRetries) {
              console.log(`⚠️  Query busy, retrying in ${this.retryDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
              setTimeout(() => {
                this.retryDelay = Math.min(this.retryDelay * 1.5, this.maxRetryDelay);
                attemptQuery(retryCount + 1);
              }, this.retryDelay);
            } else {
              console.error('❌ Query failed:', err.message);
              reject(err);
            }
          } else {
            resolve(rows);
          }
        });
      };
      
      attemptQuery();
    });
  }

  // Execute single query with retry logic
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      const attemptQuery = (retryCount = 0) => {
        this.db.get(sql, params, (err, row) => {
          if (err) {
            if (err.code === 'SQLITE_BUSY' && retryCount < this.maxRetries) {
              console.log(`⚠️  Query busy, retrying in ${this.retryDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
              setTimeout(() => {
                this.retryDelay = Math.min(this.retryDelay * 1.5, this.maxRetryDelay);
                attemptQuery(retryCount + 1);
              }, this.retryDelay);
            } else {
              console.error('❌ Query failed:', err.message);
              reject(err);
            }
          } else {
            resolve(row);
          }
        });
      };
      
      attemptQuery();
    });
  }

  // Execute run query with retry logic
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      const attemptQuery = (retryCount = 0) => {
        this.db.run(sql, params, function(err) {
          if (err) {
            if (err.code === 'SQLITE_BUSY' && retryCount < this.maxRetries) {
              console.log(`⚠️  Query busy, retrying in ${this.retryDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
              setTimeout(() => {
                this.retryDelay = Math.min(this.retryDelay * 1.5, this.maxRetryDelay);
                attemptQuery(retryCount + 1);
              }, this.retryDelay);
            } else {
              console.error('❌ Query failed:', err.message);
              reject(err);
            }
          } else {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      };
      
      attemptQuery();
    });
  }

  // Execute transaction with retry logic
  async transaction(operations) {
    return new Promise(async (resolve, reject) => {
      const attemptTransaction = async (retryCount = 0) => {
        try {
          await this.run('BEGIN TRANSACTION');
          
          for (const operation of operations) {
            if (operation.type === 'run') {
              await this.run(operation.sql, operation.params);
            } else if (operation.type === 'query') {
              await this.query(operation.sql, operation.params);
            }
          }
          
          await this.run('COMMIT');
          resolve();
        } catch (err) {
          try {
            await this.run('ROLLBACK');
          } catch (rollbackErr) {
            console.error('❌ Rollback failed:', rollbackErr.message);
          }
          
          if (err.code === 'SQLITE_BUSY' && retryCount < this.maxRetries) {
            console.log(`⚠️  Transaction busy, retrying in ${this.retryDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
            setTimeout(() => {
              this.retryDelay = Math.min(this.retryDelay * 1.5, this.maxRetryDelay);
              attemptTransaction(retryCount + 1);
            }, this.retryDelay);
          } else {
            console.error('❌ Transaction failed:', err.message);
            reject(err);
          }
        }
      };
      
      await attemptTransaction();
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('🔒 Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = DatabaseManager;
