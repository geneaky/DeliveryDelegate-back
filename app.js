const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const authenticate = require('./api/middlewares/auth');
const {sequelize} = require('./models');
const usersRouter = require('./api/routes/users');
const reviewRouter = require('./api/routes/review');
const storeRouter = require('./api/routes/store');

const app = express();

var http = require('http').Server(app);
const io = require('socket.io')(http)

dotenv.config();
sequelize.sync({force:false})
    .then(() => {
      console.log('success connecting database');
    })
    .catch((err) => {
      console.log('fail connecting database');
    });



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
/* socket.id */
io.on("connection",(socket) =>{
  console.log(`new Client : ${ip}, socket.id : ${socket.id}`);
  socket.on('connect user', function(user){
      console.log("Connected user ");
      socket.join(user['roomName']);
      console.log("roomName : ",user['roomName']);
      console.log("state : ",socket.adapter.rooms);
      io.emit('connect user', user);
  });

  socket.on('chat message', function(msg){
      console.log("Message " + msg['message']);
      console.log("보내는 아이디 : ",msg['roomName']);
      io.to(msg['roomName']).emit('chat message', msg);
  });

});