var db = require('./db');

var userSocks = {
  sockList: {},
  add: function(email, socket) {
    if (!this.sockList[email]) {
      console.log("userSocks: Adding socket.");
      this.sockList[email] = socket;
    } else {
      console.log('userSocks: Re-adding socket.');
      var oldSocket = this.sockList[email];
      this.sockList[email] = socket;
      oldSocket.disconnect();
    }
  },
  has: function(email) {
    if (this.sockList[email]) {
      return true;
    } else {
      return false;
    }
  }
};

exports.doSocket = function(socket) {
  socket.on('user join', function(email, fn) {
    if (email != '') {
      db.join_user(email, function() {
        console.log(email + ' has joined.');
        if (!userSocks.has(email)) {
          socket.broadcast.emit('user connected', email);
        }
        userSocks.add(email, socket);
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
        if (!err && email) {
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
          var responseObj = {
            status: 'error',
            message: 'Error retrieving logged in email. Please refresh and login again.'
          }
          fn(responseObj);
        }
      });
    }
  });

  socket.on('disconnect', function() {
    socket.get('email', function(err, email) {
      if (!err) {
        // if disconnecting socket is not the same as current socket being used for
        // communication with email, don't publish left.
        if (userSocks.sockList[email] && userSocks.sockList[email].id == socket.id) {
          console.log(email + ' has left.');
          socket.broadcast.emit('user disconnected', email);
        }
      } else {
        console.log('unknown has left.');
        socket.broadcast.emit('user disconnected', 'unknown');
      }
    });
  })
}