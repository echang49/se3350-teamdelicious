require('dotenv').config()

///Both the front-end and the back-end must use a single network endpoint
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const { admin, firestore, auth } = require("./firebase")

const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, '/client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(5000);
console.log('App is listening on port 5000');