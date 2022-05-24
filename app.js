const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const authenticate = require('./api/middlewares/auth');
const {sequelize} = require('./models');
const usersRouter = require('./api/routes/users');
const reviewRouter = require('./api/routes/review');
const storeRouter = require('./api/routes/store');

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
// app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);
app.use('/store', authenticate, storeRouter);
app.use('/review', authenticate, reviewRouter);

app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status|| 500).send(err.message);
});

app.listen(process.env.DEVELOPMENT_PORT || 8080,() => {
  console.log('Server Start on ',process.env.DEVELOPMENT_PORT);
});

const err = new Error()