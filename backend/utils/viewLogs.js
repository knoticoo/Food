const fs = require('fs');
const path = require('path');

function viewLogs(type = 'all', limit = 50) {
  const logsDir = path.join(__dirname, '../logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('No logs directory found. Run the server first to generate logs.');
    return;
  }

  const files = fs.readdirSync(logsDir);
  const logFiles = files.filter(file => file.endsWith('.json'));

  if (logFiles.length === 0) {
    console.log('No log files found.');
    return;
  }

  console.log(`\n=== LOGS (showing last ${limit} entries) ===\n`);

  logFiles.forEach(file => {
    if (type !== 'all' && !file.includes(type)) {
      return;
    }

    const filePath = path.join(logsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const logs = JSON.parse(content);

    console.log(`\n📁 ${file} (${logs.length} entries):`);
    console.log('─'.repeat(50));

    // Show last N entries
    const recentLogs = logs.slice(-limit);
    
    recentLogs.forEach((log, index) => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      const action = log.action || 'unknown';
      const status = log.action?.includes('successful') ? '✅' : 
                    log.action?.includes('failed') ? '❌' : 'ℹ️';
      
      console.log(`${status} [${timestamp}] ${action}`);
      
      if (log.error) {
        console.log(`   Error: ${log.error}`);
      }
      if (log.reason) {
        console.log(`   Reason: ${log.reason}`);
      }
      if (log.email) {
        console.log(`   Email: ${log.email}`);
      }
      if (log.duration) {
        console.log(`   Duration: ${log.duration}ms`);
      }
      console.log('');
    });
  });
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const type = args[0] || 'all';
  const limit = parseInt(args[1]) || 50;
  
  viewLogs(type, limit);
}

module.exports = { viewLogs };