const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname + '/public'));

// send the user to index html page inspite of the url
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});
app.get('/deploy.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'deploy.html'));
});
app.get('/deployAdvanced.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'deployAdvanced.html'));
});
app.get('/interact.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'interact.html'));
});

app.listen(port);