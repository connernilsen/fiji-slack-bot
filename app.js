const express = require('express');
const app = express();

app.get('/message', (req, res) => {
  console.log("Request received");
});

app.listen(process.env.PORT, () => { console.log("Server started") });
