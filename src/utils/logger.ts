class Logger {
  private isNode: boolean;

  constructor() {
    this.isNode = typeof window === 'undefined';
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  log(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('LOG', message, data);
    console.log(`%c${message}`, 'color: #4CAF50; font-weight: bold;', data || '');
  }

  error(message: string, error?: any): void {
    const formattedMessage = this.formatMessage('ERROR', message, error);
    console.error(`%c${message}`, 'color: #f44336; font-weight: bold;', error || '');
  }

  warn(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('WARN', message, data);
    console.warn(`%c${message}`, 'color: #ff9800; font-weight: bold;', data || '');
  }

  info(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('INFO', message, data);
    console.info(`%c${message}`, 'color: #2196F3; font-weight: bold;', data || '');
  }

  debug(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('DEBUG', message, data);
    console.debug(`%c${message}`, 'color: #9C27B0; font-weight: bold;', data || '');
  }
}

// Create a singleton instance
const logger = new Logger();

export default logger;