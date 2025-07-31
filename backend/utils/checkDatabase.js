const dbChecker = require('./dbChecker');
const { viewLogs } = require('./viewLogs');

async function checkDatabase() {
  console.log('\n🔍 DATABASE CHECKER');
  console.log('='.repeat(50));

  try {
    // Check database integrity
    console.log('\n1. Checking database integrity...');
    const integrity = await dbChecker.checkDatabaseIntegrity();
    console.log('✅ Database integrity:', integrity);

    // Get database stats
    console.log('\n2. Getting database statistics...');
    const stats = await dbChecker.getDatabaseStats();
    console.log('📊 Total users:', stats.userCount);

    // Get recent users
    console.log('\n3. Recent users (last 10):');
    const recentUsers = await dbChecker.getRecentUsers(10);
    if (recentUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      recentUsers.forEach((user, index) => {
        const date = new Date(user.createdAt).toLocaleString();
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Created: ${date}`);
      });
    }

    // Check specific user if email provided
    const args = process.argv.slice(2);
    if (args.length > 0) {
      const email = args[0];
      console.log(`\n4. Checking specific user: ${email}`);
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
    }

    console.log('\n5. Recent logs:');
    viewLogs('all', 10);

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

// Command line usage
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };