const express = require('express');
const app = express();
const zalgo = require('zalgo-js');
const axios = require('axios');
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

  var answer = { 
    blocks: [ 
      {
        type: "section",  
        text: {
          response_type: "in_channel",
          type: "mrkdwn",
          text: "*" + zalgo.summon()(req.body["text"]) + "*"
        }
      }
    ]
  };

  axios.post(req["response_url"], answer)
    .then((res) => {
      console.log("Code: " + res.statusCode);
    })
    .catch((error) => {
      console.error(error);
    });
});

app.listen(process.env.PORT, () => { console.log("Server started") });
//app.listen(8081, () => { console.log("Server started") });
