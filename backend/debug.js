#!/usr/bin/env node

const { checkDatabase } = require('./utils/checkDatabase');
const { viewLogs } = require('./utils/viewLogs');
const dbChecker = require('./utils/dbChecker');

async function runDebug() {
  console.log('\n🐛 PET APP DEBUG TOOL');
  console.log('='.repeat(50));

  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  switch (command) {
    case 'db':
      await checkDatabase();
      break;
    
    case 'logs':
      const logType = args[1] || 'all';
      const limit = parseInt(args[2]) || 20;
      viewLogs(logType, limit);
      break;
    
    case 'check-user':
      if (args[1]) {
        const email = args[1];
        console.log(`\n🔍 Checking user: ${email}`);
        try {
          const user = await dbChecker.checkUserExists(email);
          if (user) {
            console.log('✅ User found:', {
              id: user.id,
              name: user.name,
              email: user.email,
              createdAt: new Date(user.createdAt).toLocaleString()
            });
          } else {
            console.log('❌ User not found');
          }
        } catch (error) {
          console.error('❌ Error checking user:', error.message);
        }
      } else {
        console.log('❌ Please provide an email: node debug.js check-user <email>');
      }
      break;
    
    case 'stats':
      try {
        const stats = await dbChecker.getDatabaseStats();
        const recentUsers = await dbChecker.getRecentUsers(5);
        console.log('\n📊 DATABASE STATISTICS');
        console.log('─'.repeat(30));
        console.log(`Total users: ${stats.userCount}`);
        console.log(`Recent users: ${recentUsers.length}`);
        if (recentUsers.length > 0) {
          console.log('\nRecent users:');
          recentUsers.forEach((user, index) => {
            const date = new Date(user.createdAt).toLocaleString();
            console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${date}`);
          });
        }
      } catch (error) {
        console.error('❌ Error getting stats:', error.message);
      }
      break;
    
    case 'all':
    default:
      console.log('\nRunning comprehensive debug...\n');
      await checkDatabase();
      console.log('\n' + '='.repeat(50));
      viewLogs('all', 15);
      break;
  }
}

// Show help if no arguments
if (process.argv.length === 2) {
  console.log(`
🐛 PET APP DEBUG TOOL

Usage: node debug.js <command> [options]

Commands:
  all              - Run comprehensive debug (default)
  db               - Check database state and integrity
  logs [type] [n] - View logs (type: all, registrations, logins, errors)
  check-user <email> - Check if specific user exists
  stats            - Show database statistics

Examples:
  node debug.js
  node debug.js logs registrations 10
  node debug.js check-user test@example.com
  node debug.js stats
`);
} else {
  runDebug();
}