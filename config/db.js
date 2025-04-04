require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(process.env.SSL_CA_PATH), // Only CA cert needed
    },
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: process.env.DB_LIMIT,
    queueLimit: 0
});

module.exports = pool.promise();