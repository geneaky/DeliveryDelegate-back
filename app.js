const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize } = require('./models');
const usersRouter = require('./api/routes/users');
const indexRouter = require('./api/routes/index');
const reviewRouter = require('./api/routes/review');
const storeRouter = require('./api/routes/store');

var app = express();

// port set
app.set('port',process.env.PORT || 8080);



// sequelize 연결
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// router
app.use('/user', usersRouter); //  /user/...
app.use('/store', storeRouter); //  /store/...
app.use('/review', reviewRouter); // /review/...


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

 
app.listen(app.get('port'),() => {
  console.log(app.get('port'),'번 포트에서 서버 실행중');
}); 


module.exports = app;


/* socket.io 관련 코드  (수정중)
const websocket = require('./socket.js'); // socket연결


const server = require('http').createServer(app);
const io = require('socket.io')(server);

*/  