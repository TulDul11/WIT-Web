# Requirements

## Commands to run

`npm install express`

`npm install cors`

`npm install body-parser`

`npm install path`

`npm install mysql2`

***OR***

`npm install express path body-parser cors mysql2`

## .env File

```
envdbhost=YourDatabaseHost
envdbuser=YourDatabaseUser
envdbpass=YourDatabasePassword
envdbname=YourDatabaseName
envdbport=YourDatabasePort
envdblimit=YourDatabaseUserLimit
PORT=3000
```
Replace _envdbhost_, _envdbuser_, _envdbpass_, _envdbname_, _envdbport_ and _evdblimit_ with the names you wish to use.

## config Folder
### db.js

```
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.envhost,
    user: process.env.envuser,
    password: process.env.envpass,
    database: process.env.envdbname,
    port: process.env.envdbport,
    waitForConnections: true,
    connectionLimit: envdblimit,
    queueLimit: 0
});

module.exports = pool.promise();
```
Make sure to replace _envdbhost_, _envdbuser_, _envdbpass_, _envdbname_, _envdbport_ and _evdblimit_ with your .env variable names.