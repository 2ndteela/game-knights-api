const express = require('express');
const socket = require('socket.io')
var cors = require('cors')

const  responseMessage = (StatusCode, Data, Message) => {
    return {
        status: !StatusCode ? 200 : StatusCode,
        data: !Data ? 'OK' : Data,
        message: !Message ? 'OK' : Message
    }
}

// App setup
var app = express();
app.use(cors())
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000');
});

// Static files
app.use(express.static('public'));

let io = socket(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: false
    }
})

let games = {}

io.on('connection', (s) => { 
   console.log('connected to client:' + s.id)
   s.emit('connection', responseMessage(200, s.id))

    s.on('new-he-said', so => {
        console.log('got new game request')
        console.log(so)
        games[so] = { players: [], stories: [] }

        console.log(games)
        io.sockets.emit('game-created', responseMessage())
    })

    s.on('join-he-said', so => {
        console.log('data be:', so)
        console.log( 'games', games)

        const check = games[so.lobbyCode]
        console.log('check', check)
        if(check !== undefined) {
            console.log(s.id + " joined the game")
            io.sockets.emit('he-said-joined', responseMessage(200, socket.id, 'Ok'))
            io.sockets.emit('updated-player-count', responseMessage(200, Math.ceil(Math.random() * 10)), 'OK')
        }
        else io.sockets.emit('he-said-joined', responseMessage(500, "error", "couldn't join game with code " + so.lobbyCode))
    })

    s.on('start-he-said', so => {
        console.log('game started')
        
        io.sockets.emit('he-said-started', responseMessage(200, 'Game Start', 'OK'))
    })

    s.on('respond-he-said', so => {

    })

    s.on('end-he-said', so => {

    })
})
