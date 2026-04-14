require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const errorHandler = require('./middlewares/errorHandler');
const requireAdmin = require('./middlewares/roleSecurity');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
app.use(express.json());

// Modular Routers
app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api/admin', requireAdmin, adminRoutes);

// Health Check
app.get('/', (req, res) => res.status(200).send('UniSmart API Core (Modular V2)'));

// Centralized Error Catching
app.use(errorHandler);

module.exports = app;