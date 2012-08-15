$(function() {
  regExs = {};
  regExs.email = /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  
  $errorMsg = $('#error-msg');
  $yourEmail = $('#your-email-input');
  $yourEmail.find('>input').focus();
  $targetEmail = $('#target-email-input');

  $loginCont = $('#login-container');
  $chatCont = $('#chat-container');
  $chatBox = $('#chat-box');
  $chatInput = $('#chat-input');

  $yourEmail.keypress(function(e) {
    $errorMsg.fadeOut();
    if (e.charCode == 13) {
      var $this = $(this);
      var $input =  $this.find('>input');
      if (regExs.email.test($input.val()) == false) {
        showError(userMsgs.invalidEmail);
      } else {
        yourEmail = $input.val();
        conn.joinChat(yourEmail, function(data) {
          if (data == true) {
            addChat(userMsgs.youAreConnected);
            $loginCont.fadeOut(function() {
              $chatCont.fadeIn(function() {
                $chatInput.find(">input").focus();
              });
            });
          } else {
            showError(userMsgs.connectFailed);
          }
        });
        /*$this.fadeOut(function() {
          $targetEmail.fadeIn();
          $targetEmail.find('>input').focus();
        });*/
      }
    }
  });

  $chatInput.keypress(function(e) {
    if (e.charCode == 13) {
      var $this = $(this);
      var $input =  $this.find('>input');
      if ($input.val().length > 0) {
        var message = $input.val();
        conn.chat(message, function(data) {
          if (data.status == 'success') {
            $input.val('');
            addChat(formatMessage(data));
          } else {
            addChat(data.message)
          }
        });
      }
    }
  });

  /*$targetEmail.keypress(function(e) {
    $errorMsg.fadeOut();
    if (e.charCode == 13) {
      var $this = $(this);
      var $input =  $this.find('>input');
      if (regExs.email.test($input.val()) == false) {
        showError(userMsgs.invalidEmail);
      } else {
        targetEmail = $input.val();
        $loginCont.fadeOut(function() {
          $chatCont.fadeIn();
        });
      }
    }
  });*/
});


function showError(errorMsg) {
  $errorMsg.text(errorMsg);
  $errorMsg.fadeIn(function() {
    setTimeout(function() {
      $errorMsg.fadeOut();
    }, 2000);
  });
}

function addChat(msg) {
  $chatBox.append(msg + '<br />');
  $chatBox.scrollTop($chatBox[0].scrollHeight);
}

function formatMessage(message) {
  var date = new Date(message.time);
  var dateString = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  var formedMsg = dateString + " <strong>" + message.email + ":</strong> " + message.message;
  return formedMsg;
}