const db = require('../config/database');
const logger = require('./logger');

class DatabaseChecker {
  constructor() {
    this.db = db;
  }

  async checkUserExists(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id, name, email, createdAt FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          logger.logDatabase({
            action: 'check_user_exists_error',
            email,
            error: err.message
          });
          reject(err);
        } else {
          logger.logDatabase({
            action: 'check_user_exists_result',
            email,
            userExists: !!row,
            userData: row || null
          });
          resolve(row);
        }
      });
    });
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT id, name, email, createdAt FROM users ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
          logger.logDatabase({
            action: 'get_all_users_error',
            error: err.message
          });
          reject(err);
        } else {
          logger.logDatabase({
            action: 'get_all_users_result',
            userCount: rows.length,
            users: rows
          });
          resolve(rows);
        }
      });
    });
  }

  async getUserById(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
          logger.logDatabase({
            action: 'get_user_by_id_error',
            userId,
            error: err.message
          });
          reject(err);
        } else {
          logger.logDatabase({
            action: 'get_user_by_id_result',
            userId,
            userExists: !!row,
            userData: row || null
          });
          resolve(row);
        }
      });
    });
  }

  async getDatabaseStats() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as userCount FROM users', (err, result) => {
        if (err) {
          logger.logDatabase({
            action: 'get_database_stats_error',
            error: err.message
          });
          reject(err);
        } else {
          logger.logDatabase({
            action: 'get_database_stats_result',
            stats: result
          });
          resolve(result);
        }
      });
    });
  }

  async checkDatabaseIntegrity() {
    return new Promise((resolve, reject) => {
      this.db.get('PRAGMA integrity_check', (err, result) => {
        if (err) {
          logger.logDatabase({
            action: 'database_integrity_check_error',
            error: err.message
          });
          reject(err);
        } else {
          logger.logDatabase({
            action: 'database_integrity_check_result',
            integrity: result
          });
          resolve(result);
        }
      });
    });
  }

  async getRecentUsers(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT id, name, email, createdAt FROM users ORDER BY createdAt DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
          logger.logDatabase({
            action: 'get_recent_users_error',
            limit,
            error: err.message
          });
          reject(err);
        } else {
          logger.logDatabase({
            action: 'get_recent_users_result',
            limit,
            userCount: rows.length,
            users: rows
          });
          resolve(rows);
        }
      });
    });
  }
}

module.exports = new DatabaseChecker();