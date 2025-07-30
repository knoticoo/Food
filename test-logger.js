const logger = require('./src/utils/logger.ts');

console.log('Testing logger functionality...');

logger.log('🚀 Test log message');
logger.info('📊 Test info message');
logger.warn('⚠️ Test warning message');
logger.error('❌ Test error message');
logger.debug('🔍 Test debug message');

console.log('Logger test completed. Check app.log file for output.');