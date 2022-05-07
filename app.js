const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const {sequelize} = require('./models');
const UserRouter = require('./api/routes/users');
const ReviewRouter = require('./api/routes/review');
const StoreRouter = require('./api/routes/store');

dotenv.config();

sequelize.sync({force:false})
    .then(() => {
      console.log('success connecting database');
    })
    .catch((err) => {
      console.log('fail connecting database');
    });

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', UserRouter);
app.use('/store', StoreRouter);
app.use('/review', ReviewRouter);

app.use((err, req, res, next) => {
  console.log(err.message);
  res.send('Error');
});

app.listen(process.env.DEVELOPMENT_PORT || 8080,() => {
  console.log('Server Start');
});