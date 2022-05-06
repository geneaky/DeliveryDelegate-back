const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize } = require('./models');
const { User } = require('./models');
const usersRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const reviewRouter = require('./routes/review');
const storeRouter = require('./routes/store');

var app = express();

// port set
app.set('port',process.env.PORT || 8080);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

// router 나중에 '/' -> '/@@'로 수정 예정
app.use('/', indexRouter); //  /...
app.use('/', usersRouter); //  /user/...
app.use('/', storeRouter); //  /store/...
app.use('/', reviewRouter); // /review/...


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