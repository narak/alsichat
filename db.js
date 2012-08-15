var databaseUrl = "alsichat";
var collections = ['users', 'messages'];
console.log(process.env.MONGOHQ_URL); 
var db = require('mongojs').connect(process.env.MONGOHQ_URL || databaseUrl, collections);

exports.add_message = function(message, next, failed) {
  db.messages.save(message, function(err, saved) {
    if (err || !saved) {
      failed();
    } else {
      console.log(message);
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



/*
db.users.find({sex: "female"}, function(err, users) {
  if( err || !users) console.log("No female users found");
  else users.forEach( function(femaleUser) {
    console.log(femaleUser);
  } );
});

db.users.save({email: "srirangan@gmail.com", password: "iLoveMongo", sex: "male"}, function(err, saved) {
  if( err || !saved ) console.log("User not saved");
  else console.log("User saved");
});

db.users.update({email: "srirangan@gmail.com"}, {$set: {password: "iReallyLoveMongo"}}, function(err, updated) {
  if( err || !updated ) console.log("User not updated");
  else console.log("User updated");
});
*/