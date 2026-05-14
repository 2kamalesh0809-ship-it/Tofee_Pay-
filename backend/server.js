require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const groupRoutes = require('./routes/groups');
const memberRoutes = require('./routes/members');
const transactionRoutes = require('./routes/transactions');
const paymentLinkRoutes = require('./routes/paymentLinks');
const webhookRoutes = require('./routes/webhooks');

const app = express();

// Serve static files from the frontend directory
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use('/api/webhooks', (req, res, next) => {
    console.log(`[WEBHOOK_INCOMING] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payment-links', paymentLinkRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
