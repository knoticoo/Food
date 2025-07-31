# Debug Tools for Pet App

This directory contains comprehensive debugging tools to help troubleshoot registration and login issues.

## Quick Start

1. **Run the server** to generate logs:
   ```bash
   cd backend
   npm start
   ```

2. **Use the debug tool** to check everything:
   ```bash
   node debug.js
   ```

## Available Tools

### 1. Main Debug Script (`debug.js`)
The main debugging tool that combines all functionality:

```bash
# Comprehensive debug (default)
node debug.js

# Check database only
node debug.js db

# View logs only
node debug.js logs

# View specific log types
node debug.js logs registrations 10
node debug.js logs logins 10
node debug.js logs errors 10

# Check specific user
node debug.js check-user test@example.com

# Database statistics
node debug.js stats
```

### 2. Database Checker (`utils/dbChecker.js`)
Verifies user existence and database integrity:

```javascript
const dbChecker = require('./utils/dbChecker');

// Check if user exists
const user = await dbChecker.checkUserExists('test@example.com');

// Get all users
const users = await dbChecker.getAllUsers();

// Get database stats
const stats = await dbChecker.getDatabaseStats();
```

### 3. Log Viewer (`utils/viewLogs.js`)
Displays JSON logs in a readable format:

```bash
node utils/viewLogs.js
node utils/viewLogs.js registrations 20
```

### 4. Database Checker Script (`utils/checkDatabase.js`)
Comprehensive database inspection:

```bash
node utils/checkDatabase.js
node utils/checkDatabase.js test@example.com
```

## Log Files

Logs are stored in `backend/logs/` as JSON files:

- `registrations-YYYY-MM-DD.json` - Registration attempts
- `logins-YYYY-MM-DD.json` - Login attempts  
- `errors-YYYY-MM-DD.json` - Errors and exceptions
- `database-YYYY-MM-DD.json` - Database operations
- `auth_attempts-YYYY-MM-DD.json` - All authentication attempts

## What Gets Logged

### Registration Process
- ✅ Registration attempt with request details
- ✅ Database user existence check
- ✅ Password hashing
- ✅ User creation in database
- ✅ User verification after creation
- ✅ Token generation
- ❌ Validation errors
- ❌ Database errors
- ❌ User already exists

### Login Process
- ✅ Login attempt with request details
- ✅ Database user lookup
- ✅ Password verification
- ✅ Token generation
- ❌ User not found
- ❌ Invalid password
- ❌ Database errors

### Database Operations
- ✅ User existence checks
- ✅ Database integrity checks
- ✅ Statistics queries
- ❌ Database connection errors
- ❌ Query execution errors

## Troubleshooting Common Issues

### 1. User Can't Register
```bash
# Check if user already exists
node debug.js check-user user@example.com

# View registration logs
node debug.js logs registrations 20

# Check database integrity
node debug.js db
```

### 2. User Can't Login
```bash
# Check if user exists in database
node debug.js check-user user@example.com

# View login logs
node debug.js logs logins 20

# Check for password issues
node debug.js logs errors 10
```

### 3. Database Issues
```bash
# Check database integrity
node debug.js db

# View database logs
node debug.js logs database 10

# Get database stats
node debug.js stats
```

### 4. General Debugging
```bash
# Run comprehensive check
node debug.js

# View all recent logs
node debug.js logs all 30
```

## Log Format

Each log entry contains:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "type": "registrations",
  "requestId": "uuid",
  "action": "registration_successful",
  "email": "user@example.com",
  "duration": 150,
  "userAgent": "Mozilla/5.0...",
  "ip": "127.0.0.1"
}
```

## Tips

1. **Start the server first** - Logs are only generated when the server is running
2. **Check logs immediately** - After registration/login attempts, run the debug tool
3. **Look for patterns** - Multiple failed attempts might indicate a specific issue
4. **Verify database state** - Always check if users actually exist in the database
5. **Check for errors** - Error logs often contain the root cause

## Example Debug Session

```bash
# 1. Start server
npm start

# 2. Try to register/login in the app

# 3. Run debug tool
node debug.js

# 4. Check specific user if needed
node debug.js check-user test@example.com

# 5. View specific logs
node debug.js logs registrations 10
```