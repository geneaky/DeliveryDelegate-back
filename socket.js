const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/game');

gameSocketNameSpace.on('connection', (socket) => {

    socket.on('attend',({room_name}) => {
        socket.join(room_name);
        socket.to(room_name).emit('hi', socket.id+'입장');
    });

    socket.on('sendMessage', (data) => {
        const {socketId, msg} = data;
        socket.to(socketId).emit('test', msg);
    })
});

httpServer.listen(8080,() => {
    console.log('Server Start');
});