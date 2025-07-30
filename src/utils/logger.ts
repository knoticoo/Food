import fs from 'fs';
import path from 'path';

class Logger {
  private logFile: string;
  private isNode: boolean;

  constructor() {
    this.isNode = typeof window === 'undefined';
    this.logFile = path.join(process.cwd(), 'app.log');
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}\n`;
  }

  private writeToFile(message: string): void {
    if (this.isNode) {
      try {
        fs.appendFileSync(this.logFile, message);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  log(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('LOG', message, data);
    console.log(message, data || '');
    this.writeToFile(formattedMessage);
  }

  error(message: string, error?: any): void {
    const formattedMessage = this.formatMessage('ERROR', message, error);
    console.error(message, error || '');
    this.writeToFile(formattedMessage);
  }

  warn(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('WARN', message, data);
    console.warn(message, data || '');
    this.writeToFile(formattedMessage);
  }

  info(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('INFO', message, data);
    console.info(message, data || '');
    this.writeToFile(formattedMessage);
  }

  debug(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('DEBUG', message, data);
    console.debug(message, data || '');
    this.writeToFile(formattedMessage);
  }
}

// Create a singleton instance
const logger = new Logger();

export default logger;