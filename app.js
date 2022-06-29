const express = require('express');
const fetch = require('node-fetch');
const app = express();
const { pool } = require('./config');
const ejs = require('ejs');
const flash = require('express-flash');
require('dotenv').config();

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/user/register', (req, res) => {
  res.render('register');
});

app.post('/user/register', (req, res) => {
  res.render('register');
});
app.get('/user/login', (req, res) => {
  res.render('login');
});

app.get('/user/dashboard', (req, res) => {
  res.render('dashboard', { user: req.user.name });
});

app.get('/user/logout', (req, res) => {
  req.logout();
  res.render('index', { message: 'has ingresado correctamente' });
});

app.post('/user/home', async (req, res) => {
  let { name, password, password_confirm } = req.body;
  let errors = [];

  if (!name || !password || !password_confirm) {
    errors.push({ message: 'Por favor ingrese todas las filas correctamente' });
  }
  if (password.length < 4) {
    errors.push({ message: 'La contraseña debe tener mínimo 4 caracteres' });
  }

  if (password !== password_confirm) {
    errors.push({ message: 'Las contraseñas no coinciden' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, name, password, password_confirm });
  } else {
    const body = {
      name: name,
      password: password
    };

    try {
      const response = await fetch('http://localhost:5000/auth-service/register-company/', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if(data){
        res.render('home', {token: data['token'], company: data['company'] , ip: data['ip']});
      }
      } catch (error) {
      res.render('register', { message: 'Error' });
    }
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/user/dashboard');
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/user/login');
}

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});
