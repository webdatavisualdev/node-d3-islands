const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(serveStatic(__dirname, {'index': ['public/index.html']}))

var json = [];
var positions = [];

for (var y = 1 ; y <= 100 ; y ++) {
    for (var x = 1 ; x <= 100 ; x ++) {
        positions.push({x: x * 4 - 2, y: y * 4 - 2});
    }
}

for (var i = 0 ; i < 10000 ; i ++) {
    var rnd = Math.floor(Math.random() * 10000);
    var temp = positions[i];
    positions[i] = positions[rnd];
    positions[rnd] = temp;
}

for (var i = 0 ; i < 4000 ; i ++) {
    json.push({
        id: i,
        color: getRandomColor(),
        text: getRandomText(),
        url: getRandomUrl(),
        highlighted: getRandomHighlighted(),
        size: getRandomSize(),
        position: positions[i * 2]
    });
}

const content = JSON.stringify(json);

if (!fs.existsSync('build')){
    fs.mkdirSync('build');
}

fs.writeFile("build/world-islands.json", content, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomText() {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    var text = '';
    for (var i = 0; i < 6; i++) {
        text += letters[Math.floor(Math.random() * 26)];
    }
    return text;
}

function getRandomHighlighted() {
    return parseInt(Math.random() * 2) === 1 ? true : false;
}

function getRandomUrl() {
    var count = Math.floor(Math.random() * 10);
    count = count > 4 ? count : 4;
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    var url = 'https://';
    for (var i = 0; i < count; i++) {
        url += letters[Math.floor(Math.random() * 26)];
    }
    url += '.com';
    return url;
}

function getRandomSize() {
    var size = Math.floor(Math.random() * 5);
    size = size > 1 ? size : 1;
    return size;
}

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));