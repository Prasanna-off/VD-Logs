const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const staffRoutes = require('./routes/staff.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const taskRoutes = require('./routes/task.routes');
const workLogRoutes = require('./routes/worklog.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const auditRoutes = require('./routes/audit.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VD Logs Backend API',
    organization: 'Vishvadaan Educational and Charitable Trust'
  });
});

// Mount application API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/work-logs', workLogRoutes);
app.use('/api/v1/admin/analytics', analyticsRoutes);
app.use('/api/v1/admin/audit-logs', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      ...(process.env.NODE_ENV === 'development' && { details: err.details || err.stack })
    }
  });
});

module.exports = app;
