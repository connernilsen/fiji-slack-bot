const express = require('express');
const app = express();
const zalgo = require('zalgo-js');
app.use(express.json());

app.get('/', (req, res) => {
  console.log("Request received" + req.toString());
  res.send("Success");
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body["challenge"]);
});

app.post('/corrput', (req, res) => {
  console.log("TEST");
  res.send();
  console.log(req.body);
  console.log(zalgo(req.body["text"]));

  var answer = { 
    blocks: [ 
      {
        type: "section",  
        text: {
          response_type: "in_channel",
          type: "mrkdwn",
          text: "*" + zalgo(req.body["text"]) + "*"
        }
      }
    ]
  };

  res.type("application/json");
  res.send(answer);
});

app.listen(process.env.PORT, () => { console.log("Server started") });
//app.listen(8081, () => { console.log("Server started") });
