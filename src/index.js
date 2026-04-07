require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware');
const routes = require('./routes/index');
const sequelize = require('./db');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('UniSmart API is up and running!');
});

app.get('/api/db-check', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ message: 'Neon Database is connected successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.use('/', routes);
app.use(errorMiddleware);

module.exports = app;