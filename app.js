const express = require('express');
const app = express();
import zalgo from "zalgo-js";
app.use(express.json());

app.get('/', (req, res) => {
  console.log("Request received" + req.toString());
  res.send("Success");
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body["challenge"]);
});

app.post('/corrput' (req, res) => {
  console.log(zalgo(req.body));
  res.send(zalgo(req.body));
}

app.listen(process.env.PORT, () => { console.log("Server started") });
