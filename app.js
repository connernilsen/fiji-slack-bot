const express = require('express');
const app = express();
const zalgo = require('zalgo-js');
const fetch = require('node-fetch');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const token = "xoxp-457909895632-457909897568-873858915351-6b583d276546766dcebee91832ad9913";

app.get('/', (req, res) => {
  console.log("Request received" + req.body);
  res.send("Success");
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body["challenge"]);
});

app.post('/corrupt', (req, res) => {
  //console.log(req.body);
  res.send();
  var user = req.body["user_id"];
  var userInfo = getUserInfo(user);
  console.log(userInfo);

  var text = req.body["text"];
  var intensity = 0.3;
  if (text.length > 1 && !isNaN(parseInt(text.charAt(0)))) {
    intensity = parseInt(text.charAt(0)) / 10;
    text = text.substring(1);
  }
  text = text.trim();

  var answer = { 
    type: "mrkdwn",
    text: "*" + zalgo.summon({intensity: intensity})(text) + "*",
    channel: req.body["channel_id"]
  };

  var response = {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(answer)
  };

  fetch("https://slack.com/api/chat.postMessage", response)
    .catch((err) => console.err(err));
});

function getUserInfo(userID) {
  var url = `https://slack.com/api/users.info?token=${token}&user=${userID}`;
  console.log(url);

  let json;
  fetch(url)
    .then((res) => json = res.json())
    .catch((err) => console.err(err));

  return json;
}

app.listen(process.env.PORT, () => { console.log("Server started") });
//app.listen(8081, () => { console.log("Server started") });
