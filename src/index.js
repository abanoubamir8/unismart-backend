require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware');
const routes = require('./routes/index');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('UniSmart API is up and running!');
});

app.use('/', routes);

app.use(errorMiddleware);

module.exports = app;