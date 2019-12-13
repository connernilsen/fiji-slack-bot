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
  var intensity = 0.8;
  if (text.length > 1 && Number.isInteger(charAt(0))) {
    intensity = parseInt(charAt(0)) / 10;
    text = text.substring(1);
  }

  var answer = { 
    type: "mrkdwn",
    text: "*" + zalgo.summon({intensity: intensity})(text) + "*"
  };

  var response = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answer)
  };

  fetch(req.body["response_url"], response)
    .then((res) => {
      console.log("Code: " + res.json().statusCode);
    })
    .catch((err) => console.err(err));
});

app.listen(process.env.PORT, () => { console.log("Server started") });
//app.listen(8081, () => { console.log("Server started") });
