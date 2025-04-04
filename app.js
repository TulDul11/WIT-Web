require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const router = require('./routes/router');
const PORT = process.env.PORT || 3000;

const API_URL = process.env.API_URL; 

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

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
app.use('/', router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {});