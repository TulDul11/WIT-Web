require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const serverPort = 3001
const contextURL = '/RETO_API'; 
const api = '/api'; 

module.exports= {
   dbHost: process.env.DB_HOST,
   dbPort: process.env.DB_PORT,
   dbUser: process.env.DB_USER,
   dbPass: process.env.DB_PASS,
   dbName: process.env.DB_NAME,
   serverPort,
   contextURL,
   api
}