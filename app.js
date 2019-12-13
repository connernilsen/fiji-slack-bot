const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  console.log("Request received" + req.toString());
  res.send("Success");
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body["challenge"]);
});

app.listen(process.env.PORT, () => { console.log("Server started") });
