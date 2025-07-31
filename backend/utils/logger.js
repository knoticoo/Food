const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getLogFileName(type) {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `${type}-${date}.json`);
  }

  log(type, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      ...data
    };

    const logFile = this.getLogFileName(type);
    
    try {
      let logs = [];
      if (fs.existsSync(logFile)) {
        const fileContent = fs.readFileSync(logFile, 'utf8');
        logs = JSON.parse(fileContent);
      }
      
      logs.push(logEntry);
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
      
      // Also log to console for immediate visibility
      console.log(`[${type.toUpperCase()}]`, JSON.stringify(logEntry, null, 2));
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }

  logAuthAttempt(data) {
    this.log('auth_attempts', data);
  }

  logRegistration(data) {
    this.log('registrations', data);
  }

  logLogin(data) {
    this.log('logins', data);
  }

  logError(data) {
    this.log('errors', data);
  }

  logDatabase(data) {
    this.log('database', data);
  }
}

module.exports = new Logger();