const express = require('express');
const bodyParser = require('body-parser');

const opensearch = require('./routes/opensearchRouter');
const home = require('./routes/homeRouter');

const app = express();

// parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static('public'));

// Normalise all querystring values to lowercase
app.use((req, res, next) => {
  req.query = new Proxy(req.query, {
    get: (target, name) =>
      target[Object.keys(target).find((key) => key.toLowerCase() === name.toLowerCase())],
  });

  next();
});

app.use('/opensearch', opensearch);

app.get('/', home);

module.exports = app;
