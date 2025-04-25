require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/router');
const db =  require('./config/db');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigins = [
    'http://localhost:3000',
    'http://0.0.0.0:3000',
    'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io',
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));  

const sessionStore = new MySQLStore({}, db);

app.use(session({
    key: 'user_session',
    secret: process.env.SES_SEC,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}));
 
app.use('/', router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/course', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'course.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
