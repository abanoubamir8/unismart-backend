require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware');
const routes = require('./routes/index');
const sequelize = require('./db');

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
