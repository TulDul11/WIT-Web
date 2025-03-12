const mysql = require('mysql2');
const constants = require('../utils/constants');

const pool = mysql.createPool({
    host: constants.dbHost,
    port: constants.dbPort,
    user: constants.dbUser,
    password: constants.dbPass,
    database: constants.dbName
});

module.exports = pool;