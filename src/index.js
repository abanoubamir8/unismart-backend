require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const errorHandler = require('./middlewares/errorHandler');
const requireAdmin = require('./middlewares/roleSecurity');

const app = express();

app.use(helmet());


app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api/admin', requireAdmin, adminRoutes);

app.get('/', (req, res) => res.status(200).send('UniSmart API Core (Modular V2 / Neon Masterpiece)'));

app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Development Server running on port ${PORT}`);
  });
}

module.exports = app;