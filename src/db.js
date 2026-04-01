const { Sequelize } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

module.exports = sequelize;