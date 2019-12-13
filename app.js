const express = require('express');
const app = express();
const zalgo = require('zalgo-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// initialize .env and middleware
dotenv.config();
const token = process.env.TOKEN;
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// default page
app.get('/', (req, res) => {
  console.log("Request received" + req.body);
  res.send("Success");
});

// initialize slack bot 
app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body["challenge"]);
});

// corrupt function
app.post('/corrupt', (req, res) => {
  res.send();
  var user = req.body["user_id"];

  // get calling user's info and send response
  getUserInfo(user, (userJson) => {
    // set original text and intensity
    var text = req.body["text"];
    var intensity = 0.3;

    // interpret intensity if given
    if (text.length > 1 && !isNaN(parseInt(text.charAt(0)))) {
      intensity = parseInt(text.charAt(0)) / 10;
      text = text.substring(1);
    }
    
    // remove trailing whitespace
    text = text.trim();
    
    // return if nothing
    if (text.length == 0) {
      return;
    }

    // prepare response
    var answer = { 
      // text to show
      text: "*" + zalgo.summon({intensity: intensity})(text) + "*",
      // channel to post in
      channel: req.body["channel_id"],
      // user icon to use
      "icon_url": userJson["user"]["profile"]["image_24"],
      // user to impersonate
      username: userJson["user"]["real_name"]
    };

    // send message
    post(answer);
  });
});

// expand specified text
app.post('/expand', (req, res) => {
  // send default response and get userID
  res.send();
  var user = req.body["user_id"];

  // get calling user's info and send response
  getUserInfo(user, (userJson) => {
    var text = req.body["text"].trim();
    
    // don't run if empty
    if (text.length == 0) {
      return;
    }

    // function to expand string
    var expand = (str) => {
      var arr = str.toUpperCase().split("");
      var ans = arr[0];

      // loop through and append expanded letter
      for (i = 1; i < arr.length; i++) {
        if (arr[i] != " ") {
          ans += ` ${arr[i]}`;
        }
      }
      return ans;
    }

    //initialize vars
    var idx = text.indexOf("<");
    var ans = "";
    var tmp = "";
    var end = -1;
    
    // loop through and greedily E X P A N D
    while (idx != -1) {
      // append non-selected text
      ans += text.substring(0, idx);

      // set end and expand through end
      end = text.indexOf(">");
      if (end != -1) {
        tmp = text.substring(idx + 1, end);
        ans += expand(tmp);
      }
      // if end not found, then expand rest of text
      else {
        tmp = text.substring(idx + 1);
        ans += expand(tmp);
      }

      // set text to be the remaining text to check
      if (end + 1 < text.length && end != -1) {
        text = text.substring(end + 1);
      }
      // set to empty string if nothing left to expand
      else {
        text = "";
      }

      // get next selection
      idx = text.indexOf("<");
    }

    // append remaining text if there is any
    if (text.length > 0) {
      ans += text;
    }

    // prepare answer
    var answer = {
      text: "*" + ans + "*",
      channel: req.body["channel_id"],
      "icon_url": userJson["user"]["profile"]["image_24"],
      username: userJson["user"]["real_name"]
    };

    post(answer);
  });
});

// function to send messages with
function post(res) {
  // response to post with
  var response = {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(res)
  };

  // post message
  fetch("https://slack.com/api/chat.postMessage", response)
    .catch((err) => console.err(err));
}

// get given user's info
function getUserInfo(userID, func) {
  var url = `https://slack.com/api/users.info?token=${token}&user=${userID}`;

  // get info and pass into supplied function
  fetch(url)
    .then((res) => json = res.json())
    .then((json) => func(json))
    .catch((err) => console.log(err));
}

// start app
app.listen(port, () => { console.log("Server started on port " + port) });
