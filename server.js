let express = require('express');
let app = express().use(express.static(__dirname + '/'))
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    socket.on('disconnect', function () {
        io.emit('users-changed', {
            user: socket.roomName,
            event: 'left'
        });
    });

    socket.on('set-roomName', (roomName) => {
        socket.roomName = roomName;
        io.emit('users-changed', {
            user: roomName,
            event: 'joined'
        });
    });

    socket.on('add-message', (message) => {
        io.emit('message', {
            text: message.text,
            from: socket.roomName,
            created: new Date()
        });
    });
});

var port = process.env.PORT || 3001;

http.listen(port, function () {
    console.log('listening in http://localhost:' + port);
});