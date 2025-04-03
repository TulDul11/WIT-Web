require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const router = require('./routes/router');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));   
app.use('/', router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* -> For deployment */
app.listen(3000, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${PORT}`)
});

/* -> Local development */
/*
app.listen(PORT, () => {
    console.log(`Server running on localhost:${PORT}`)
});
*/