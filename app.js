const express = require('express');
const app = express();
const zalgo = require('zalgo-js');
const fetch = require('node-fetch');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  console.log("Request received" + req.body);
  res.send("Success");
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body["challenge"]);
});

app.post('/corrupt', (req, res) => {
  console.log(req.body);
  res.send();

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
    "as_user": true,
    channel: req.body["channel_id"]
  };

  var response = {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: "Bearer xoxp-457909895632-457909897568-873858915351-6b583d276546766dcebee91832ad9913"
    },
    body: JSON.stringify(answer)
  };

  //fetch(req.body["response_url"], response)
  fetch("https://slack.com/api/chat.postMessage", response)
    .then((res) => {
      console.log("Code: " + res.json().statusCode);
    })
    .catch((err) => console.err(err));
});

app.listen(process.env.PORT, () => { console.log("Server started") });
//app.listen(8081, () => { console.log("Server started") });
