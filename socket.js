const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('./api/middlewares/jwt');
const {User, Delegator, Order, Game} = require('./models');
const fs = require('fs');
const {Op, TIME, DataTypes} = require("sequelize");
const moment = require('moment');

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/games');

gameSocketNameSpace.on('connection', (socket) => {

    try {

        socket.on('last_attend', async (message) => {
            let {room_name, token} = JSON.parse(message);

            const user = await jwt.verify(token);

            let delegator = await Delegator.findOne({
                where: {user_id: user?.id}
            });

            let game = await Game.findOne({
                where: {game_id: delegator?.game_id}
            }).catch((err) => {
                console.log(err);
            })

            if(game?.socket_room_name == room_name) {
                socket.join(room_name);
            }
        })

        //게임 방장 생성 후 참가
        socket.on('attendMaster', async (message) => {
            let {room_name} = JSON.parse(message);

            socket.join(room_name);
            socket.emit('attend', socket?.id + '입장');
            socket.to(room_name).emit('attend', socket?.id + '입장');
            console.log('attendMaster 동작');
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

            const user_model = await User.findOne({
                where: {user_id: user.id}
            }).catch((err) => {
                console.log(err);
            })
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
            socket?.to(room_name).emit('attend', user_model.nickname + '입장');
            console.log('attend 동작');
        });

        //게임 준비
        socket.on('ready_game', async (message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            //게임 참석한 대표자들의 상태를 게임 준비상태로 update
            await Delegator.update({
                status: true
            }, {
                where: {
                    user_id: user.id
                }
            }).catch(err => {
                console.log(err);
            })

            //준비완료 메세지 전달
            socket?.to(room_name).emit('ready_game', 'ready')
            socket?.emit('ready_game', 'ready')
            console.log('ready 동작');
        })

        //게임 시작전 방장을 제외한 모든 대표자들이 ready했는지 방장이 확인
        socket.on('check_ready', async (message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let daepyo = await Delegator.findOne({
                where: {user_id: user.id}
            });

            //대표가 아닐 경우 분기 처리
            if (daepyo.ranking !== 1) {
                console.log('대표가 아니라서 탈출');
                return;
            }

            let attenderList = await Delegator.findAll({
                where: {game_id: daepyo.game_id}
            }).catch((err) => {
                console.log(err);
            })

            for (let idx in attenderList) {
                if (attenderList[idx].ranking !== 1 && attenderList[idx].status === false) {
                    socket?.to(room_name).emit('check_ready', 'not_ready')
                    socket?.emit('check_ready', 'not_ready')
                    return;
                }
            }
            socket?.emit('check_ready', 'complete_ready')
            socket?.to(room_name).emit('check_ready', 'complete_ready')
            console.log('check_ready 동작');
        })

        //참여자 목록
        socket.on('delegator_list', async (message) => {
            let {token, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let delegator = await Delegator.findOne({
                where: {user_id: user.id}
            }).catch((err) => {
                console.log(err);
            })

            let delegators = await Delegator.findAll({
                where: {game_id: delegator.game_id}
            }).catch((err) => {
                console.log(err);
            })

            let array = delegators.map(d => d?.user_id);

            let users = await User.findAll({
                where: {
                    user_id: {[Op.in]: array}
                }
            });

            let result = [];

            for (let user of users) {
                result.push(user.nickname)
            }

            socket?.emit('delegator_list', result);
            console.log('delegator_list 동작')
        })

        //게임 시작
        socket.on('on_game', async (message) => {
            let {token, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let daeypo = await Delegator.findOne({
                where: {user_id: user.id}
            }).catch((err) => {
                console.log(err);
            })

            let attenderList = await Delegator.findAll({
                where: {game_id: daeypo.game_id}
            }).catch((err) => {
                console.log(err);
            })

            for (let i = 0; i < 5; i++) {
                attenderList.sort(() => Math.random() - 0.5);
            }

            for (let idx in attenderList) {
                await Delegator.update({
                        ranking: Number(idx) + 1,
                        status: true
                    }, {
                        where: {delegator_id: attenderList[idx].delegator_id}
                    }
                ).catch((err) => {
                    console.log(err);
                })
            }
            //랜덤 배치 끝 -> 이후 안드로이드에서 게임 결과 요청
            socket?.to(room_name).emit('on_game', 'game_end')
            socket?.emit('on_game', 'game_end')
            console.log('on_game 동작');
        })

        //ranking 1이 나가면 게임, delegator, order 다 삭제
        socket.on('quit_game', async (message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let delegator = await Delegator.findOne({
                where: {user_id: user.id}
            })

            console.log(delegator);

            //방장이 나가면 게임 삭제, 관련된 예비 대표들도 다 삭제
            if (delegator?.ranking == 1) {
                await Delegator.destroy({
                    where: {game_id: delegator.game_id}
                }).catch((err) => {
                    console.log(err);
                });

                await Game.destroy({
                    where: {socket_room_name: room_name}
                }).catch((err) => {
                    console.log(err);
                })

                socket?.to(room_name).emit('quit_game', '방이 폭파되었습니다')
                socket?.emit('quit_game', '방이 폭파되었습니다')
                socket?.disconnect()
            } else { //예비 대표자가 나가면 해당 예비 대표 이름만 전달
                await Delegator.destroy({
                    where: {user_id: user.id}
                }).catch((err) => {
                    console.log(err);
                });


                socket?.to(room_name).emit('quit_game', nickname);
                socket?.disconnect();
            }
        })

        //안드로이드 게임 결과 전송, 사용자 모두에게 ranking정보를 넘겨줘?
        socket.on('game_result', async (message) => {
            let {token, game_id} = JSON.parse(message)

            const user = await jwt.verify(token);

            let delegator = await Delegator.findOne({
                where: {user_id: user.id}
            });

            if (delegator.ranking !== 1) {
                socket?.emit('game_result', '대표자가 선정되었습니다')
                console.log('예비대표자들에게 : 대표자가 선정되었습니다');
                return;

            } else {

                console.log(game_id);
                console.log(typeof game_id);
                let delegators = await Delegator.findAll({
                    where: {game_id: game_id}
                });

                console.log('test1::' + delegators)

                let array = delegators.map(d => d?.delegator_id);

                console.log('test2::' + array)

                let orders = await Order.findAll({
                    where: {
                        delegator_id: {[Op.in]: array}
                    }
                });

                console.log('test3::' + orders)

                let result = [];

                for (let order of orders) {
                    result.push({
                        store_name: order?.store_name,
                        mapx: order?.mapx,
                        mapy: order?.mapy,
                        detail: order?.detail
                    })
                }

                socket?.emit('game_result', result);
                console.log('대표자에게: 대표자로 선정되었습니다')
            }
        });

        // 대표자 탈주 -> 알림 후 -> 게임 삭제, 패널티 부과
        socket.on('delegator_run_away', async (message) => {
            let {token, room_name} = JSON.parse(message)
            const user = await jwt.verify(token);

            let userModel = await User.findOne({
                where: {user_id: user.id}
            });

            userModel.penalty = true;
            userModel.penalty_date = moment().add(30, 'days').toDate();

            await userModel.save();

            let delegator = await Delegator.findOne({
                where: {user_id: user.id}
            });

            if (delegator.ranking !== 1) {
                return;
            }

            await Delegator.destroy({
                where: {game_id: delegator.game_id}
            }).catch((err) => {
                console.log(err);
            });

            await Game.destroy({
                where: {socket_room_name: room_name}
            }).catch((err) => {
                console.log(err);
            })

            socket?.to(room_name).emit('delegator_run_away', '대표자가 탈주했습니다');
            console.log('대표자 탈주 이벤트 동작');
        });


        //대표자 랜드마크 도착 -> 안드로이드에서 대표자가 랜드마크에 도착하면 해당 이벤트를 참여자들에게 알림
        socket.on('arrive', (message) => {
            let {room_name} = JSON.parse(message)
            socket?.to(room_name).emit('arrive', '대표자가 랜드마크에 도착했습니다');
            socket?.emit('arrive', '대표자가 랜드마크에 도착했습니다');
            console.log('대표자 랜드마크 도작 이벤트 동작')
        });

    } catch (err) {
        console.log(err);
    }
})

httpServer.listen(8080,() => {
    const dir1 = './ocr_uploads';
    const dir2 = './review_uploads';
    if (!fs.existsSync(dir1)){fs.mkdirSync(dir1);}
    if (!fs.existsSync(dir2)){fs.mkdirSync(dir2);}

    console.log('Server Start');
});
