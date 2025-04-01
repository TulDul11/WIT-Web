var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');

const router = require('./routes/router');
const PORT = process.env.PORT || 3000;

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: true}));   
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on localhost: ${PORT}`));