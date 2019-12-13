const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log("Request received" + req.toString());
  res.send("Success");
});

app.post('/', (req, res) => {
  console.log("");
  console.log(req.body);
  console.log("");
  res.send("Success");
});

app.listen(process.env.PORT, () => { console.log("Server started") });
