// Indactes Dependencies to be used in JS File
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');

// Adding our own dependencies
const constants = require("./utils/constants");
const router = require('./routes/route');

// Initialize Express
var app = express();

// Define Port of Operation over HTTP Express Web Server
const port = constants.serverPort;

// Middldeware
app.use(bodyParser.urlencoded({extended: true}));   
app.use(bodyParser.json());
app.use(cors());

// Router
app.use(router)

// Serve static files (like HTML, CSS, JS)
app.use('/templates', express.static(path.join(__dirname, '../../templates')));
app.use('/styles', express.static(path.join(__dirname, '../../styles')));
app.use('/scripts', express.static(path.join(__dirname, '../../scripts')));
app.use('/images', express.static(path.join(__dirname, '../../images')));

// Endpoint Gateway Definition
app.get('/', (req, res) => {
    res.redirect('../../templates/index.html');
});

// Start Listening web server requests...
app.listen(port, () => console.log(`Server running on localhost:${port}`));