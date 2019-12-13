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

    // perform zalgo on text
    var corrupt = (str) => zalgo.summon({intensity: intensity})(str);

    // remove trailing whitespace
    text = text.trim();
    
    // return if nothing
    if (text.length == 0) {
      return;
    }

    // perform between delimiters
    var ans = performBetween(text, corrupt);

    // post corrupted text
    postAsUser(userJson, req, "*" + ans + "*");
  });
});

// expand specified text
app.post('/space', (req, res) => {
  // send default response and get userID
  res.send();
  var user = req.body["user_id"];

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
  };

  // get calling user's info and send response
  getUserInfo(user, (userJson) => {
    console.log(userJson);
    var text = req.body["text"].trim();
    //
    // don't run if empty
    if (text.length == 0) {
      return;
    }

    // perform between delimiters
    var ans = performBetween(text, expand);

    // post e x p a n d e d text
    postAsUser(userJson, req, ans);
  });
});

// vertically expand specified text
app.post("/vspace", (req, res) => {
  // send default response and get userID
  res.send();
  var user = req.body["user_id"];

  // function to expand string
  var vexpand = (str) => {
    var arr = str.toUpperCase().split("");
    var ans = "";

    // loop through and append expanded letter
    for (i = 0; i < arr.length; i++) {
      if (arr[i] != " ") {
        ans += `\n${arr[i]}`;
      }
    }
    ans += "\n";
    return ans;
  };

  // get calling user's info and send response
  getUserInfo(user, (userJson) => {
    var text = req.body["text"].trim();

    // don't run if empty
    if (text.length == 0) {
      return;
    }

    var ans = performBetween(text, vexpand);

    postAsUser(userJson, req, ans);
  });
});

// perform function between delimiter for text
function performBetween(text, func, deliml = "<", delimr = ">") {
  //initialize vars
  var idx = text.indexOf(deliml);
  var ans = "";
  var tmp = "";
  var end = -1;

  // loop through and greedily E X P A N D
  while (idx != -1) {
    // append non-selected text
    ans += text.substring(0, idx);

    // set end and perform func through end
    end = text.indexOf(delimr);
    if (end != -1) {
      tmp = text.substring(idx + 1, end);
      ans += func(tmp);
    }
    // if end not found, then perform func on rest of text
    else {
      tmp = text.substring(idx + 1);
      ans += func(tmp);
    }

    // set text to be the remaining text to check
    if (end + 1 < text.length && end != -1) {
      text = text.substring(end + 1);
    }
    // set to empty string if nothing left to perform func on
    else {
      text = "";
    }

    // get next selection
    idx = text.indexOf(deliml);
  }

  // append remaining text if there is any
  if (text.length > 0) {
    ans += text;
  }

  return ans;
}

// make a post as user
function postAsUser(userJson, req, text) {
  // prepare answer
  var res = {
    text: text,
    channel: req.body["channel_id"],
    "icon_url": userJson["user"]["profile"]["image_24"],
    username: userJson["user"]["real_name"]
  };

  var hook = (channel, timestamp) => addReacts(channel, timestamp);

  post(res, hook);
}

// function to send messages with
function post(res, hook = null) {
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
    .then((res) => {
      if (hook != null) {
        hook(res);
      }
    })
    .catch((err) => console.log(err));
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

function addReacts(channel, timestamp) {
  var reactAdd = "https://slack.com/api/reactions.add";
  var emojiList = `https://slack.com/api/emoji.list?token=${token}`;
  
  fetch(emojiList)
    .then((res) => res.json())
    .then((json => {
      var emojis = Object.keys(json["emoji"]);

      var body = {
        token: token,
        channel: channel,
        timestamp: timestamp,
        emoji: ""
      }

      for (i = 0; i < Math.floor(Math.random() * 5); i++) {
        var emoji = emojis[Math.floor(Math.random() * emojis.length)];
        body["emoji"] = emoji;

        var req = {
          method: "POST",
          headers: {
            "Content-Type": "applications/json",
          },
          body: JSON.stringify(body)
        }

        fetch(reactAdd, req)
          .catch((err) => console.log(err));
      }
    }))
    .catch((err) => console.log(err));
}

// start app
app.listen(port, () => { console.log("Server started on port " + port) });
