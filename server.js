const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const srv = http.createServer(app);
const wss = new WebSocket.Server({ server: srv });

srv.listen(8090, () => {
    console.log('iam listening port 8090');
});
app.use(express.static(path.join(__dirname, 'public')));


let clnts = [];
let rms = {};

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        let msgData;
            msgData = JSON.parse(msg);
        if (msgData.login) {
            ws.username = msgData.username;
            clnts.push(ws);
            bcast({
                type: 'login',
                message: `${ws.username}  join chat`,
                online: getOnlineUsers()
            });
        } else if (msgData.body) {
            bcast({
                type: 'chat',
                message: msgData.body,
                online: getOnlineUsers()
            }, ws.room);
        } else if (msgData.room) {
            if (ws.room && rms[ws.room]) {
                rms[ws.room] = rms[ws.room].filter(client => client !== ws);
            }

            ws.room = msgData.room;
            if (!rms[ws.room]) {
                rms[ws.room] = [];
            }
            rms[ws.room].push(ws);

            bcast({
                type: 'room',
                message: `${ws.username}  joined  ${ws.room}`,
                room: ws.room,
                online: getOnlineUsers()
            }, ws.room);
        }
    });

    ws.on('close', () => {
        clnts = clnts.filter(client => client !== ws);
        if (ws.room && rms[ws.room]) {
            rms[ws.room] = rms[ws.room].filter(client => client !== ws);
        }

        bcast({
            type: 'logout',
            message: `${ws.username}  left `,
            online: getOnlineUsers()
        });
    });
});

function getOnlineUsers() {
    return clnts.map(client => client.username);
}

function bcast(msg, room = null) {
    const msgString = JSON.stringify(msg);
    if (room) {
        rms[room].forEach(client => client.send(msgString));
    } else {
        clnts.forEach(client => client.send(msgString));
    }
}




