/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , db = require('./db')
  , sock = require('./socket');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser()); // for parsing post body.
  app.use(express.methodOverride()); // for recognising _method for PUT/DELETE.
  app.use(express.cookieParser('8skjGFOu387Kgjhdk')); // needed for sessions.
  app.use(express.session({key: 'sid', cookie: {secure: true, maxAge: 3600000}})); // set to an hour.
  app.use(app.router); // mentioned here purely for ordering purposes of Connect.js. Gets executed by default anyway.
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public'))); // static content server.
  app.use(express.errorHandler({ dumpExceptions: true, showMessage: true })); // http://extjs.github.com/Connect/errorHandler.html
  app.locals({
  	appName: 'alsichat 0.0.1'
  })
});

app.get('/', routes.index);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/*
 * Socket IO
 */
var socket = io.listen(server);
socket.configure(function () { 
  socket.set("transports", ["xhr-polling"]); 
  socket.set("polling duration", 10); 
  socket.set('log level', 1);
});


socket.on('connection', sock.doSocket);
