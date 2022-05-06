const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const usersRouter = require('./api/routes/users');
const indexRouter = require('./api/routes/index');
const reviewRouter = require('./api/routes/review');
const storeRouter = require('./api/routes/store');

dotenv.config();
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', usersRouter);
app.use('/store', storeRouter);
app.use('/review', reviewRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.log(err.message);
  res.send('Error');
});

app.listen(process.env.DEVELOPMENT_PORT || 8080,() => {
  console.log('Server Start');
});