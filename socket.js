const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/games');

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

httpServer.listen(8080);