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

    try{
        //게임 방장 생성 후 참가
        socket.on('attendMaster', async (message) => {
            let {room_name} = JSON.parse(message);

            socket.join(room_name);
            socket.emit('attend', socket?.id + '입장');
            socket.to(room_name).emit('attend', socket?.id + '입장');
        });

        //게임 참석
        socket.on('attend', async (message) => {
            let {token, game_id, room_name, size, order} = JSON.parse(message);
            const user = await jwt.verify(token);

            if ((await gameSocketNameSpace.in(room_name).allSockets()).size === size) {
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
            socket?.to(room_name).emit('attend', socket.id + '입장');
        });

        //게임 준비
        socket.on('ready_game', async(message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user_id = await jwt.verify(token);

            //게임 참석한 대표자들의 상태를 게임 준비상태로 update
            await Delegator.update({
                status: true
            },{
              where: {
                    user_id: user_id
              }
            }).catch(err => {
                console.log(err);
            })

            //준비완료 메세지 전달
            socket?.to(room_name).emit('ready_game', 'ready')
        })

        //게임 시작전 방장을 제외한 모든 대표자들이 ready했는지 방장이 확인
        socket.on('check_ready', async(message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user_id = await jwt.verify(token);

            let daepyo = await Delegator.findOne({
                where: { user_id : user_id }
            });

            let attenderList = await Delegator.findAll({
                where: {game_id : daepyo.game_id}
            }).catch((err) => {
                console.log(err);
            })

            attenderList.forEach((attender) => {
                if(!attender.status) {
                    socket?.to(room_name).emit('check_ready', 'not_ready')
                    return;
                }
            })

            socket?.emit('check_ready', 'complete_ready')
        })

        //게임 시작
        socket.on('on_game', async(message) => {
            let {token, room_name} = JSON.parse(message)

            const user_id = await jwt.verify(token);

            let daeypo = await Delegator.findOne({
                where: {user_id: user_id}
            }).catch((err) => {
                console.log(err);
            })

            let attenderList = await Delegator.findAll({
                where: { game_id : daeypo.game_id}
            }).catch((err) => {
                console.log(err);
            })

            attenderList.sort(() => Math.random() - 0.5);

            for(const [idx,attender] of attenderList) {
                await Delegator.update({
                        ranking: idx+1
                    },{
                        where: {delegator_id: attender.delegator_id}
                    }
                ).catch((err) => {
                    console.log(err);
                })
            }
            //랜덤 배치 끝 -> 이후 안드로이드에서 게임 결과 요청
            socket?.to(room_name).emit('on_game', 'game_end')
        })

        //게임 나가기 -> 게임 방에 한 명만 남은 경우 해당 게임을 삭제 한다.
        socket.on('quit_game', async(message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user_id = await jwt.verify(token);

            if(gameSocketNameSpace.adapter.rooms.get(room_name).size === 1) {
                console.log('one')
                await Delegator.destroy({
                    include: [{
                        model: User,
                        where: {user_id: user_id}
                    }],
                    where: User.user_id
                }).catch((err) => {
                    console.log(err);
                });

                await Game.destroy({
                    where: {socket_room_name: room_name}
                }).catch((err) => {
                    console.log(err);
                })

                console.log('user who is last one quit room and destroy game, room')
                socket?.to(room_name).emit('quit_game', nickname)
                socket?.disconnect()
            } else {
                console.log('user quit room but left users in room more than one')
                socket?.to(room_name).emit('quit_game', nickname)
                socket?.disconnect();
            }
        })

        //안드로이드 게임 결과 전송
        socket.on('game_result', async (message) => {
            let {token, game_id, room_name, nickname, ranking} = JSON.parse(message)

            const user = await jwt.verify(token);

            await Delegator.update({
                ranking: ranking
            }, {
                where: {
                    user_id: user.id,
                    game_id: game_id
                }
            }).catch((err) => {
                console.log(err) // 재시도 처리 필요
            });

            let delegators = await Delegator.findAll({
                include: [{
                    model:Game,
                    where: {game_id:game_id}
                }]
            });

            let array = delegators.map(d => d.delegator_id);

            let orders = await Order.findAll({
                where: {
                    delegator_id: { in : array}
                }
            });

            if (ranking === 1) {
                socket?.emit('game_result', '대표자로 선정되었습니다' + orders);
            } else {
                socket?.emit('대표자가 선정되었습니다')
            }
        });

        // 대표자 탈주 -> 알림 후 -> 게임 삭제
        socket.on('delegator_run_away', async (message) => {
            let {token, room_name} = JSON.parse(message)
            const user = await jwt.verify(token);
            const user_id = user.id;

            await Delegator.destroy({
                include: [{
                    model: User,
                    where: {user_id: user_id}
                }],
                where: User.user_id
            }).catch((err) => {
                console.log(err);
            });

            await Game.destroy({
                where: {socket_room_name: room_name}
            }).catch((err) => {
                console.log(err);
            })

            socket?.broadcast.to(room_name).emit('delegator_run_away', '대표자가 탈주했습니다');
        });


        //대표자 랜드마크 도착 -> 안드로이드에서 대표자가 랜드마크에 도착하면 해당 이벤트를 참여자들에게 알림
        socket.on('delegator_arrive', (message) => {
            let {room_name} = JSON.parse(message)
            socket?.broadcast.to(room_name).emit('delegator_arrive', '대표자가 랜드마크에 도착했습니다');
        });

        //게임 종료
        socket.on('game_end', (socket) => {
            socket?.disconnect();
        });

        //게임 종료 후 게임 삭제 (대표자가 삭제) --> 게임 생성하자마자 삭제하는 경우도 있음
        socket.on('game_remove', async (message) => {
            let {room_name, ranking} = JSON.parse(message)
            if (ranking === 1) {
                await Delegator.destroy({
                    include: [
                        {
                            model: Game,
                            where: {socket_room_name: room_name}
                        }],
                    where: {game_id: Game.game_id}
                }).catch((err) => {
                    console.log(err);
                });

                await Game.destroy({
                    where: {socket_room_name: room_name}
                }).catch((err) => {
                    console.log(err);
                })
            }
        });

        socket.on('disconnect', (socket) => {
            console.log('bi');
        });
    } catch (e) {
        socket.emit('error', {status: 400, message: 'Bad Request'})
    }
});

httpServer.listen(8080,() => {
    const dir1 = './ocr_uploads';
    const dir2 = './review_uploads';
    if (!fs.existsSync(dir1)){fs.mkdirSync(dir1);}
    if (!fs.existsSync(dir2)){fs.mkdirSync(dir2);}

    console.log('Server Start');
});
