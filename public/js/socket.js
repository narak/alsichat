$(function() {
  conn = {};

  conn.joinChat = function(yourEmail, next) {
    var socket = conn.socket = io.connect(); //autodiscovery
    socket.emit('user join', yourEmail, function (data) {
      next(data);
    });
    socket.on('user connected', function(email) {
      addChat(email + ' ' + userMsgs.hasJoinedChat);
    });
    socket.on('user disconnected', function(email) {
      addChat(email + ' ' + userMsgs.hasLeftChat);
    });
    socket.on('chat', function(message) {
      addChat(formatMessage(message));
    });
  }

  conn.chat = function(message, next) {
    var socket = conn.socket;
    socket.emit('chat', message, function(data) {
      next(data);
    });
  }
});