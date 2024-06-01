let username = prompt("Please enter your name");
console.log(username);

var t_h = document.getElementById('title');
t_h.innerHTML = `User ${username}`;

var chatbox = document.getElementById('chatbox');
var msg_input = document.getElementById('msg');
var send_btn = document.getElementById('send');
var clear_btn = document.getElementById('clear_chat');
var online_div = document.getElementById('onlineusers');
var room_input = document.getElementById('room_name');
var join_room_btn = document.getElementById('join_room');

var current_room = null;

let mywebsocket = new WebSocket('ws://localhost:8090');
mywebsocket.onopen = function () {
    console.log('connection opened', this);
    let message_obj = {
        username: username,
        login: true
    };
    this.send(JSON.stringify(message_obj));
};

mywebsocket.onmessage = function (event) {
    console.log(event.data);
    let msg_content = JSON.parse(event.data);
    if (msg_content.type === 'login') {
        chatbox.innerHTML += `<h3 class="text-center text-success"> ${msg_content.message} </h3>`;
    } else if (msg_content.type === 'logout') {
        chatbox.innerHTML += `<h3 class="text-center text-danger"> ${msg_content.message} </h3>`;
    } else if (msg_content.type === 'chat') {
        chatbox.innerHTML += `<h4 class="w-50 bg-dark rounded-2 text-wrap text-light p-2 mx-2"> ${msg_content.message} </h4>`;
    }
    online_div.innerHTML = '';
    msg_content.online.forEach((element) => {
        online_div.innerHTML += `<li class="list-group-item"><span class="rounded-circle p-1 m-1 bg-success"></span>${element} </li>`;
    });
};

mywebsocket.onerror = function () {
    chatbox.innerHTML += '<h3 style="color: red">Error connecting to server </h3>';
};

send_btn.addEventListener('click', function () {
    let msg_val = msg_input.value;
    let message_obj = {
        body: `${username}: ${msg_val}`
    };
    mywebsocket.send(JSON.stringify(message_obj));
    chatbox.innerHTML += `<h4 class="ms-auto w-50 bg-primary text-wrap rounded-2 text-light p-2 mx-2">Me: ${msg_val}</h4>`;
    msg_input.value = '';
});

clear_btn.addEventListener('click', function () {
    chatbox.innerHTML = '';
});

join_room_btn.addEventListener('click', function () {
    let room_name = room_input.value;
    if (room_name && current_room !== room_name) {
        let message_obj = {
            room: room_name,
            username: username
        };
        mywebsocket.send(JSON.stringify(message_obj));
        current_room = room_name;
        chatbox.innerHTML += `<h4 class="text-center text-info">Joined room: ${room_name}</h4>`;
    }
});


