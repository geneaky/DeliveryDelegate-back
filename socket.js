const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/game');

gameSocketNameSpace.on('connection', (socket) => {

    socket.on('attend',async ({room_name, size}) => {
        console.log((await gameSocketNameSpace.in(room_name).allSockets()).size);
        if((await gameSocketNameSpace.in(room_name).allSockets()).size == size) {
            console.log('인원 초과');
            socket.emit('population', '인원 초과');
            return;
        }

        socket.join(room_name);
        socket.to(room_name).emit('hi', socket.id+'입장');
    });


});

httpServer.listen(8080,() => {
    console.log('Server Start');
});