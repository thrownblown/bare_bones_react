#!/usr/bin nodejs
const express = require('express');
const app = express();
const port = 9081;
const githubUsername = 'thrownblown';
const sudo = require('sudo-js');

sudo.setPassword('nickmarzu0');

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.use('/static', express.static('../dist'));

app.post('/webhooks/github', (req, res) => {
  console.log('wepostin');
  let sender = req.body.sender;
  let branch = req.body.ref;

  if (branch.indexOf('master') > -1 && sender.login === githubUsername) {
    deploy(res);
  }
});

function deploy (res) {
  sudo.exec('cd /home/thrownblown && ./deploy.sh', (err, pid, result) => {
    console.log(result);
    res.send(200);
  });
}

app.listen(port, () => console.log(`TJ REACT CLIENT SERVER - App is listening on port ${port}!`));
