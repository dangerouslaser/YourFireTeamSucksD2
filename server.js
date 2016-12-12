// Get the packages we need
var express = require('express');
var https = require('https');
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var session = require('express-session');
// Create our Express application
var app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

var key = 'b1ccfe5ba9154988b1356d03e85fa735';
var userName = 'zincbeatr';
var credentials = {desitnyKey: key, defaultUserName: userName};

var platformType = {
  'xBox': 1,
  'PlayStation': 2
}

var router = express.Router();

//Destiny Host and Base REquest
const HOST = 'http://www.bungie.net/Platform/Destiny/';
var destinyBaseRequest = request.defaults({headers: {'X-API-Key': credentials.desitnyKey}});

router.get('/getMembershipIdByUserName', function(req, res, next){
    credentials.defaultMemberType = req.query.memberType;
    var user = req.query.userName;

    if(user.charAt(0) === '#'){
      user = user.substring(1, user.length-1);
    }

    destinyBaseRequest(HOST + 'SearchDestinyPlayer/' + credentials.defaultMemberType + '/' + user + '/',
        function (err, response, body) {
          var jsonResponse, result;
          res.setHeader('Content-Type', 'application/json');
          res.status(200);

          try {
            jsonResponse = JSON.parse(body);
          } catch (e) {
            res.status(500);
            result = {ErrorCode: 500, Error: e};
          }

          if(jsonResponse.Response){
            result = jsonResponse.Response[0];
          }
          else if(jsonResponse.ErrorCode){
            res.status(401);
            result = {ErrorCode: 401, Error: jsonResponse.Message};
          }

          res.json(result);
    });
});
   
router.get('/getCharacterInfoByMembershipId', function(req, res, next){
    destinyBaseRequest(HOST + credentials.defaultMemberType + '/Account/' + req.query.membershipId + '/Summary/',
        function (err, response, body) {
          var jsonResponse, result;
          res.setHeader('Content-Type', 'application/json');
          res.status(200);

          var response = JSON.parse(body);
          res.json(response);
    });
});

router.get('/getCharacterStatsById', function(req, res, next){
    destinyBaseRequest(HOST + '/Stats/AggregateActivityStats/' + credentials.defaultMemberType+ '/' + req.query.membershipId + '/' + req.query.characterId + '/',
        function (err, response, body) {
          var jsonResponse, result;
          res.setHeader('Content-Type', 'application/json');
          res.status(200);

          try {
            result = jsonResponse = JSON.parse(body);
          } catch (e) {
            res.status(500);
            result = {ErrorCode: 500, Error: e};
          }

          res.json(result);
    });
});

router.get('/getCharacterActivityHistoryData', function(req, res, next){
    destinyBaseRequest(HOST + '/Stats/ActivityHistory/' + 
      credentials.defaultMemberType + '/' + 
      req.query.membershipId + '/' + 
      req.query.characterId + '/' + 
      '?mode=' + req.query.mode + '&page=' + req.query.page + '&definitions=true',
        function (err, response, body) {
          var jsonResponse, result;
          res.setHeader('Content-Type', 'application/json');
          res.status(200);

          try {
            result = jsonResponse = JSON.parse(body);
          } catch (e) {
            res.status(500);
            result = {ErrorCode: 500, Error: e};
          }

          res.json(result);
    });
});

router.get('/getPostGameCarnageReport', function(req, res, next){
    destinyBaseRequest(HOST + '/Stats/PostGameCarnageReport/' + req.query.instanceId + '/?definitions=true',
        function (err, response, body) {
          var jsonResponse, result;
          res.setHeader('Content-Type', 'application/json');
          res.status(200);

          try {
            result = jsonResponse = JSON.parse(body);
          } catch (e) {
            res.status(500);
            result = {ErrorCode: 500, Error: e};
          }

          res.json(result);
    });
});

router.get('/getWeaponDefinitionById', function(req, res, next){
      destinyBaseRequest(HOST + credentials.defaultMemberType + '/' + 
        '/Account/' + req.query.membershipId + '/' + 
        'Character/' +
        req.query.characterId + '/' + 
        'ItemReference/' +
        req.query.referenceId + '/' + 
        '/?definitions=true',
        function (err, response, body) {
          var jsonResponse, result;
          res.setHeader('Content-Type', 'application/json');
          res.status(200);

          try {
            result = jsonResponse = JSON.parse(body).definitions.items[req.query.referenceId];
          } catch (e) {
            res.status(500);
            result = {ErrorCode: 500, Error: e};
          }

          res.json(result);
    });
});

app.use(express.static(__dirname + '/app'));

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

// Register all our routes with /api
app.use('/api', router);

//create http and https servers
var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

// Use environment defined port or 3000
var httpPort = process.env.PORT || 3000;
var httpsPort = process.env.PORT || 8000;

// Start the server
httpServer.listen(httpPort);
