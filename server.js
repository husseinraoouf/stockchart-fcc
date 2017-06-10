const express = require('express'),
    exphbs = require('express-handlebars'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    app = express(),
    MongoClient = require('mongodb').MongoClient,
    yahooFinance = require('yahoo-finance'),
    http = require('http'),
    WebSocket = require('ws');


var mongodbUrl = "mongodb://hussein:123456@ds119682.mlab.com:19682/heroku_mflb0f6d";

var dataForge = require('data-forge');
dataForge.use(require('data-forge-to-highstock'));

dataForge.use(require('data-forge-from-yahoo'));


app.use(logger('combined'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




var hbs = exphbs.create({ helpers: require('./handlebars-helpers.js').helpers });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

function transformValue(value) {
    return new Date(value);
}

app.get('/', function(req, res){
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('charts');
        collection.find().toArray(function(er, results) {
            res.render('home', {user: req.user, names : results, port: process.argv[2]});
        });
    });

});

var now;
var past;

function getDateTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    now = year + "-" + month + "-" + day;
    past = (year-3) + "-" + month + "-" + day;
}


function getData(name, res, longname){
    getDateTime();
    yahooFinance.historical({
        symbol: name,
        from: past,
        to: now,
        period: 'd'
    }, function (err, result) {
        var dataFrame = dataForge.fromJSON(JSON.stringify(result)).transformSeries({
               "date": row => transformValue(row)
           }).generateSeries({
               "Open": function (row) { return row["open"]; },
               "High": function (row) { return row["high"]; },
               "Low": function (row) { return row["low"]; },
               "Close": function (row) { return row["close"]; },
               "Volume": function (row) { return row["volume"]; },
               "Adj Close": function (row) { return row["adjClose"]; }
           }).setIndex("date").orderBy(row => row.date).dropSeries(['date', 'open', 'high', 'low', 'close', 'volume', 'adjClose', 'symbol']);

                var highstockData = dataFrame.toHighstockOHLC();
           if (longname) {
               res.json({chart: highstockData, longname: longname});

           } else {
               MongoClient.connect(mongodbUrl, function (err, db) {
                   var collection = db.collection('charts');
                   collection.findOne({_id: name}).then(function(result) {
                       res.json({chart: highstockData, longname: result.name});
                   })
               });
           }
    });
}


app.get('/addChart', function(req, res){
    yahooFinance.quote({
        symbol: req.query.name,
        modules: ['price']
    }, function (err, quotes) {
        MongoClient.connect(mongodbUrl, function (err, db) {
            var collection = db.collection('charts');
            collection.insert({_id: req.query.name , name: quotes.price.longName}, function(er){
                if (er){
                    res.writeHead(500);
                    // res.end({status: "Error"});
                } else {
                    getData(req.query.name, res, quotes.price.longNames);
                }
            })
        });
    });

});

app.get('/deleteChart', function(req, res){
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('charts');
        collection.remove({_id: req.query.name}, function(){
            res.json({status: 'OK'})
        })
    });
});

app.get('/getData', function(req, res){
    getData(req.query.name, res);
});


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

var port = process.argv[2];
server.listen(port, function() {
  console.log('server listening on port ' + port);
});
