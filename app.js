/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , db = require('./db');

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


socket.on('connection', function(socket) {
	socket.on('user join', function(email, fn) {
    if (email != '') {
      db.join_user(email, function() {
        console.log(email + ' has joined.');
        socket.broadcast.emit('user connected', email);
        socket.set('email', email, function() {
          fn(true);
        });
      }, function() {
        fn(false);
      });
    } else {
      fn(false);
    }
	});

  socket.on('chat', function(message, fn) {
    if (message != '') {
      socket.get('email', function(err, email) {
        if (!err) {
          var messageObj = {
            status: 'success',
            email: email,
            message: message,
            time: new Date().getTime()
          }
          db.add_message(messageObj, function() {
              socket.broadcast.emit('chat', messageObj);
              fn(messageObj); //goes back to calling socket
            }, function() {
              fn('Error saving chat.');
            }
          );
        } else {
          fn('Error retrieving logged in email. Please relogin.');
        }
      });
    }
  });

  socket.on('disconnect', function() {
    socket.get('email', function(err, email) {
      if (!err) {
        console.log(email + ' has left.');
        socket.broadcast.emit('user disconnected', email);
      } else {
        console.log('unknown has left.');
        socket.broadcast.emit('user disconnected', 'unknown');
      }
    });
  })
});
