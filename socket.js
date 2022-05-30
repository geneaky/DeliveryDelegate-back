const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('/api/middlewares/jwt');
const {User, Delegator, Game} = require('./models');

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/game');

gameSocketNameSpace.on('connection', (socket) => {

    socket.on('attend',async ({token,game_id,room_name, size}) => {
        const user = await jwt.verify(token);

        if((await gameSocketNameSpace.in(room_name).allSockets()).size == size) {
            console.log('인원 초과');
            socket.emit('population', '인원 초과');
            return;
        }

        await Delegator.create({
            game_id: game_id,
            user_id: user.id
        }).catch((err) => {
            console.log(err);
            return socket.disconnect();
        })

        socket.join(room_name);
        socket.to(room_name).emit('hi', socket.id+'입장');
    });

    socket.on('game_end',async ({token,game_id,room_name,nickname,ranking}) => {
        const user = await jwt.verify(token);

        Delegator.update({
            ranking: ranking
        },{
            where:{
                user_id: user.id,
                game_id: game_id
            }
        }).catch((err) => {
            console.log(err);
            return; // 재시도 처리 필요
        });

        socket.to(room_name).emit('end', '대표자'+ nickname);
    });


});

httpServer.listen(8080,() => {
    console.log('Server Start');
});