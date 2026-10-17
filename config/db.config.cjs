const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')
dotenv.config()

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD || "", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  dialectOptions: process.env.NODE_ENV === 'production'
    ? { ssl: { rejectUnauthorized: false } }
    : {}
});

module.exports = sequelize 