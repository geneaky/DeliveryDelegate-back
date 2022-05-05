/* socket 관련 코드, 수정중 */
const app = require('express')();
const SocketIO = require("socket.io");
const server = require('http').createServer(app);
const io = require('socket.io')(server);

module.exports = (server) => {
    const io = SocketIO(server,{path:"/view/socket.io"}); // path : index.js 와 동일한 위치
    io.on("connection",(socket) =>{
        const req = socket.request;
        const ip = req.headers["x-forwarded-for"] ||
                    req.connection.remoteAddress;
        console.log(
            `new Client : ${ip}, socket.id : ${socket.id}`
        );

        socket.on("disconnect",()=>{
            console.log(`Client Out : ${ip}, socket.id : ${socket.id}`);
            clearInterval(socket.interval);
        });
        socket.in("error",(error) => { });

        socket.on("from client" , (data) => {  //client가 넘긴 데이터
            console.log(data);
        });

        socket.interval=setInterval(() => {  //send 대신 emit으로 데이터를 보냄
            socket.emit("from server", "message from server");
        },3000);
        /* io.emit은 모든 소켓에게 이벤트를 보내는 것이고 socket.emit은 특정 소켓에만 이벤트를 보내는 매서드
        emit의 인자는 이벤트명, 메시지*/
        
    });
};