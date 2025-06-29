const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { mailbox, mailboxLogin } = require('./functions/apple-mail.js');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

app.use(cors());

app.use(bodyParser.json());

let datas = [];

app.get('/data', (req, res) => {
  res.json(datas);
});

app.post('/post', (req, res) => {
  const { user, password, email, date } = req.query;
  const [month, day, year] = date.split(' ');
  const birthDate = {
    month: month,
    day: day,
    year: year,
  };

  datas = [{
    username: user,
    email: email,
    password: password,
    birthDate: birthDate,
  }];

  return res.status(201).json(datas[0]);
});

const DATA_FILE = path.join(__dirname + '/data/tmp-data.json');

app.get('/mailbox', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', async(err, data) => {
    const jsonData = JSON.parse(data);
    const mail = await mailbox({
      email: jsonData.emailIcloud,
      password: jsonData.passwordIcloud
    });

    res.json({ code: mail });
  });
});

app.get('/quit', (req, res) => {
  
  exec('taskkill /F /IM firefox.exe', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error' });
    }
    if (stderr) {
      return res.status(500).json({ error: 'Error' });
    }
    res.status(200).json({ status: 'Ok' });
  });
});

let connection = [];

app.get('/connection', (req, res) => {
  res.json(connection);
});


app.get('/mailboxconnection', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', async(err, data) => {
    const jsonData = JSON.parse(data);
    const mail = await mailboxLogin({
      email: jsonData.emailIcloud,
      password: jsonData.passwordIcloud
    });

    res.json({ code: mail });
  });
});


app.post('/postconnection', (req, res) => {
  const { user, password, usernameReport } = req.query;

  connection = [{
    username: user,
    password: password,
    usernameReport: usernameReport,
  }];

  return res.status(201).json(connection[0]);
});


app.listen(6969, () => {
  console.log(`Server is running on http://localhost:6969`);
});