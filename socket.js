const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/game');

gameSocketNameSpace.on('connection', (socket) => {
    socket.on('attend',() => {
        console.log(socket.id);
        console.log('bi');
    });

    socket.on('sendMessage', (data) => {
        console.log('test');
        const {socketId, msg} = data;
        console.log(socketId);
        console.log(msg);

        socket.to(socketId).emit('test', msg);
    })
});

httpServer.listen(8080,() => {
    console.log('Server Start');
});