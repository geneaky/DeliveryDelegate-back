const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('./api/middlewares/jwt');
const {User, Delegator, Order, Game} = require('./models');
const fs = require('fs');
const {Op} = require("sequelize");

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const gameSocketNameSpace = io.of('/games');

gameSocketNameSpace.on('connection', (socket) => {

    try{

        //jackson test용 order event
        socket.on('order_test', () => {
            let order = [
                {
                    store_name: '[맘스터치]',
                    mapx: '126.86638445293917',
                    mapy: '37.5008570224444',
                    detail: '휠렛버거가 국룰이죠'
                },
                {
                    store_name: '[이삭토스트]',
                    mapx: '126.86663621946754',
                    mapy: '37.50066120597915',
                    detail: '햄치즈 토스트가 국룰이죠'
                }
            ]

            socket?.emit('order_test', order)
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
            console.log('attend 동작');
        });

        //게임 준비
        socket.on('ready_game', async(message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            //게임 참석한 대표자들의 상태를 게임 준비상태로 update
            await Delegator.update({
                status: true
            },{
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
        socket.on('check_ready', async(message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let daepyo = await Delegator.findOne({
                where: {user_id : user.id}
            });

            //대표가 아닐 경우 분기 처리
            if (daepyo.ranking !== 1) {
                console.log('대표가 아니라서 탈출');
                return;
            }

            let attenderList = await Delegator.findAll({
                where: {game_id : daepyo.game_id}
            }).catch((err) => {
                console.log(err);
            })

            for(let idx in attenderList) {
                if(attenderList[idx].ranking !==1 && attenderList[idx].status === false) {
                    socket?.to(room_name).emit('check_ready', 'not_ready')
                    socket?.emit('check_ready', 'not_ready')
                    return;
                }
            }
            socket?.emit('check_ready', 'complete_ready')
            console.log('check_ready 동작');
        })

        //게임 시작
        socket.on('on_game', async(message) => {
            let {token, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let daeypo = await Delegator.findOne({
                where: {user_id: user.id}
            }).catch((err) => {
                console.log(err);
            })

            let attenderList = await Delegator.findAll({
                where: { game_id : daeypo.game_id}
            }).catch((err) => {
                console.log(err);
            })

            for(let i = 0; i < 5; i++) {
                attenderList.sort(() => Math.random() - 0.5);
            }

            for(let idx in attenderList) {
                await Delegator.update({
                        ranking: Number(idx)+1,
                        status: true
                    },{
                        where: {delegator_id: attenderList[idx].delegator_id}
                    }
                ).catch((err) => {
                    console.log(err);
                })
            }
            //랜덤 배치 끝 -> 이후 안드로이드에서 게임 결과 요청
            socket?.to(room_name).emit('on_game', 'game_end')
            socket?.emit('on_game','game_end')
            console.log('on_game 동작');
        })

        //게임 나가기 -> 게임 방에 한 명만 남은 경우 해당 게임을 삭제 한다.
        socket.on('quit_game', async(message) => {
            let {token, nickname, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            if(gameSocketNameSpace.adapter.rooms.get(room_name).size === 1) {
                console.log('one')
                await Delegator.destroy({
                    where: { user_id : user.id}
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

        //안드로이드 게임 결과 전송, 사용자 모두에게 ranking정보를 넘겨줘?
        socket.on('game_result', async (message) => {
            let {token, game_id} = JSON.parse(message)

            const user = await jwt.verify(token);

            let delegator = await Delegator.findOne({
                where: {user_id: user.id}
            });

            if(delegator.ranking !== 1) {
                socket?.emit('game_result', '대표자가 선정되었습니다')
                console.log('예비대표자들에게 : 대표자가 선정되었습니다');
                return;

            }else{

                console.log(game_id);
                console.log(typeof  game_id);
                let delegators = await Delegator.findAll({
                    where: {game_id: game_id}
                });

                console.log('test1::'+delegators)

                let array = delegators.map(d => d?.delegator_id);

                console.log('test2::'+array)

                let orders = await Order.findAll({
                    where: {
                        delegator_id: { [Op.in] : array}
                    }
                });

                console.log('test3::'+ orders)

                let result = [];

                for(let order of orders) {
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


        /*
        면제권 사용 이벤트
        면제권을 사용하면 본인 면제권 -1 후 -> 예비 대표에게 "대표자가 면제권을 사용했습니다"라는 알림과
        -> 새로운 대표자를 뽑고 주문 정보 넘겨주고
        다른 예비 대표자들에게 "대표자가 다시 선정되었습니다" 이벤트 발생
        현재 대표자의 ranking + 1인 예비 대표자가 다음 대표자
        만일 다음 지정될 대표자의 랭킹이 마지막이라면 면제권 사용불가 알림 전달
         */

        socket.on('use_exemption', async(message) => {
            let {token, room_name} = JSON.parse(message)

            const user = await jwt.verify(token);

            let user_model = await User.findOne({
                user_id: user.id
            })

            let delegator_model = await Delegator.findOne({
                user_id: user.id
            })

            if(user_model.exemption_count < 1) {
                socket?.emit("면제권이 없습니다")
                return;
            }

            await user_model.update({exemption_count: user_model.exemption_count - 1});
            await user_model.save();

            socket?.to(room_name).emit('use_exemption',
            {
                alarm: '대표자가 면제권을 사용했습니다, 새로운 대표자를 결정합니다',
                ranking: delegator_model
            })

        })

        socket.on('re_ranking', async(message) => {
            let {token, room_name, ranking, game_id} = JSON.parse(message)

            const user = await jwt.verify(token);

            let delegator_size = await Delegator.findAll({
                game_id: game_id
            }).length

            let delegator_model = await Delegator.findOne({
                user_id : user.id
            })

            if(delegator_model.ranking === delegator_size) {
                socket?.emit('re_ranking','마지막 주자입니다 다녀오십시오')
                return;
            }

            if(delegator_model.ranking === Number(ranking)+1) {
                //대표자로 결정
                let delegators = await Delegator.findAll({
                    where: {game_id: game_id}
                });

                let array = delegators.map(d => d?.delegator_id);

                let orders = await Order.findAll({
                    where: {
                        delegator_id: { [Op.in] : array}
                    }
                });

                let result = [];

                for(let order of orders) {
                    result.push({
                        store_name: order?.store_name,
                        mapx: order?.mapx,
                        mapy: order?.mapy,
                        detail: order?.detail
                    })
                }
                socket?.emit('re_ranking',result)
                return;
            }
            socket?.emit('re_ranking','대표자가 다시 결정되었습니다')
        })

        // 대표자 탈주 -> 알림 후 -> 게임 삭제
        socket.on('delegator_run_away', async (message) => {
            let {token, room_name} = JSON.parse(message)
            const user = await jwt.verify(token);

            let daepyo = await Delegator.findOne({
                where : {user_id: user.id}
            });

            if(daepyo.ranking !== 1) {
                return;
            }

            let game = await Game.findOne({
                where: { socket_room_name: room_name}
            })

            await Delegator.destroy({
                where: { game_id : game.game_id}
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
        socket.on('delegator_arrive', (message) => {
            let {room_name} = JSON.parse(message)
            socket?.to(room_name).emit('delegator_arrive', '대표자가 랜드마크에 도착했습니다');
            console.log('대표자 랜드마크 도작 이벤트 동작')
        });

        //게임 종료
        socket.on('game_end', (socket) => {
            socket?.disconnect();
            console.log('game_end 동작')
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

                console.log('대표자가 게임 삭제')
            }

            socket?.disconnect();
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
