const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const petsRoutes = require('./routes/pets');
const tasksRoutes = require('./routes/tasks');
const taskLogsRoutes = require('./routes/taskLogs');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/task-logs', taskLogsRoutes);
app.use('/api/user', userRoutes);

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${require('os').networkInterfaces().eth0?.[0]?.address || 'your-ip'}:${PORT}`);
});