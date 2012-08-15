var databaseUrl = "alsichat";
var collections = ['users', 'messages'];
// process.env.MONGOHQ_URL: environment variable set by heroku for mongo addon instance.
var db = require('mongojs').connect(process.env.MONGOHQ_URL || databaseUrl, collections);

exports.add_message = function(message, next, failed) {
  db.messages.save(message, function(err, saved) {
    if (err || !saved) {
      failed();
    } else {
      console.log(new Date(message.time).toString() + ' ' + message.email + ': ' + message.message);
      next();
    }
  });
}

exports.join_user = function(email, next, failed) {
  db.users.findOne({email: email}, function(err, user) {
    if (err) {
      failed();
    } else {
      var currentTime = new Date().getTime();
      if (user) {
        user.lastLogin = currentTime;
        db.users.update({email: email}, user, function(err, saved) {
          if(err || !saved) {
            console.log("User not updated.");
            failed();
          } else {
            console.log("User updated.");
            next();
          }
        });
      } else {
        db.users.save({email: email, joined: currentTime, lastLogin: currentTime}, function(err, saved) {
          if(err || !saved) {
            console.log("User not saved.");
            failed();
          } else {
            console.log("User saved.");
            next();
          }
        });
      }
    }
  });  
}