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

var url = 'http://marcneuwirth.com/experiments/globe/world-countries.json';

// request(url, function(error, response, html){
//     if(!error){
//         var $ = cheerio.load(html);
//         var title, release, rating;
//         var json = { title : "", release : "", rating : ""};

//         $("pre").filter(function() {
//             var json = $(this);
//             console.log(json);
//             const content = JSON.stringify(json);
            
//             if (!fs.existsSync('build')){
//                 fs.mkdirSync('build');
//             }
            
//             fs.writeFile("build/world-islands.json", content, 'utf8', function (err) {
//                 if (err) {
//                     return console.log(err);
//                 }
            
//                 console.log("The file was saved!");
//             });
//         });
//         // $('.header').filter(function(){
//         //     var data = $(this);
//         //     title = data.children().first().text();            
//         //     release = data.children().last().children().text();
    
//         //     json.title = title;
//         //     json.release = release;
//         // })
    
//         // $('.star-box-giga-star').filter(function(){
//         //     var data = $(this);
//         //     rating = data.text();
    
//         //     json.rating = rating;
//         // })
//     }
// });

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));