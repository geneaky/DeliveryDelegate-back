const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('./api/middlewares/jwt');
const {User, Delegator, Order, Game} = require('./models');
const fs = require('fs');

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/games');

gameSocketNameSpace.on('connection', (socket) => {

    console.log('hi');
    //게임 방장 생성 후 참가
    socket.on('attendMaster', async(message) => {
        let {room_name} = JSON.parse(message);
        // let room_name = 'abcd';

        socket.join(room_name);
        socket.emit('attend', socket?.id + '입장');
        socket.to(room_name).emit('attend', socket?.id+'입장');
    });

    //게임 참석
    socket.on('attend',async (message) => {
        console.log(message);
        let {token,game_id,room_name, size,order} = JSON.parse(message);
        const user = await jwt.verify(token);

        if((await gameSocketNameSpace.in(room_name).allSockets()).size === size) {
            console.log('인원 초과');
            socket?.emit('population', '인원 초과');
            return;
        }
        const delegator = await Delegator.create({
            game_id: game_id,
            user_id: user.id
        }).catch((err) => {
            console.log(err);
            return socket?.disconnect();
        });

        await Order.create({
            delegator_id: delegator.delegator_id,
            store_name: order.store_name,
            mapx: order.mapx,
            mapy: order.mapy,
            detail: order.detail,
        }).catch((err) => {
            console.log(err);
            return socket?.disconnect();
        });

        socket?.join(room_name);
        socket?.to(room_name).emit('attend', socket.id+'입장');
    });

    //안드로이드 게임 결과 전송
    socket.on('game_result',async ({token,game_id,room_name,nickname,ranking}, next) => {
        const user = await jwt.verify(token);

        await Delegator.update({
            ranking: ranking
        },{
            where:{
                user_id: user.id,
                game_id: game_id
            }
        }).catch((err) => {
            console.log(err);
            return next(err); // 재시도 처리 필요
        });

        if(ranking === 1) {
            socket?.to(room_name).emit('game_result', '대표자'+ nickname);
        }
    });

    //대표자 참석 확인 << 이건 안드로이드에서 일정 시간 내에 <확인> 버튼 안누르면 '대표자 탈주' 이벤트 호출
    //대표자 어플 강제 종료시 << 안드로이드에서 어플 종료 이벤트 발생시 '대표자 탈주' 이벤트 호출하고

    //대표자 탈주 -> 게임에서 탈주자 제거 -> 탈주 알림
    socket.on('delegator_run_away', async(socket,{token,game_id,room_name,nickname,ranking}, next) => {
        const user = await jwt.verify(token);
        const user_id = user.id;

        await Delegator.delete({
            include:[{
                model: User,
                where: { user_id : user_id}
            }],
            where: User.user_id
        }).catch((err) => {
            console.log(err);
            return next(err);
        });

        socket?.broadcast.to(room_name).emit('delegator_run_away', '대표자가 탈주했습니다');
    });

    //대표자 다시 선정 -> 안드로이드에서 탈주 알림 받은 후 -> '대표자 다시 선정' 이벤트 호출
    socket.on('delegator_re_ranking', async({token,game_id,room_name,nickname,ranking}, next) => {
        const user = await jwt.verify(token);

        const new_ranking = ranking - 1;

        await Delegator.update({
            ranking: new_ranking
        },{
            where:{
                user_id: user.id,
                game_id: game_id
            }
        }).catch((err) => {
            console.log(err);
            return next(err); // 재시도 처리 필요
        });

        if(new_ranking === 1) {
            socket?.to(room_name)
                .emit('delegator_re_ranking', {
                    msg:'대표자'+ nickname,
                    ranking: new_ranking
                });
        }
    });


    //대표자 랜드마크 도착 -> 안드로이드에서 대표자가 랜드마크에 도착하면 해당 이벤트를 참여자들에게 알림
    socket.on('delegator_arrive', ({token,game_id,room_name, }) => {
        socket?.broadcast.to(room_name).emit('delegator_arrive', '대표자가 랜드마크에 도착했습니다');
    });

    //게임 종료
    socket.on('game_end',(socket) => {
        socket?.disconnect();
    });

    //게임 종료 후 게임 삭제 (대표자가 삭제) --> 게임 생성하자마자 삭제하는 경우도 있음
    socket.on('game_remove', async({room_name,ranking},next) => {
        if(ranking === 1) {
            await Delegator.delete({
                include:[
                    {
                        model: Game,
                        where: { socket_room_name : room_name }
                    }],
                where: { game_id : Game.game_id }
            }).catch((err) => {
                console.log(err);
                return next(err);
            });

            await Game.delete({
                where: { socket_room_name: room_name}
            }).catch((err) => {
                console.log(err);
                return next(err);
            })
        }
    })

    socket.on('disconnect', (socket) => {
        console.log('bi');
    })
});

httpServer.listen(8080,() => {
    const dir1 = './ocr_uploads';
    const dir2 = './review_uploads';
    if (!fs.existsSync(dir1)){fs.mkdirSync(dir1);}
    if (!fs.existsSync(dir2)){fs.mkdirSync(dir2);}

    console.log('Server Start');
});