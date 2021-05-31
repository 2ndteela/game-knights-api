const express = require('express')
const socket = require('socket.io')
const ResponseMessage = require('./public/util/response.js')
const Database = require('./public/util/db')

var cors = require('cors')

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
        origin: "*",
        methods: "*",
        credentials: false
    }
})

let games = {}

io.on('connection', (s) => { 
   console.log('connected to client:' + s.id)
   s.emit('connection', new ResponseMessage(200, s.id))

    s.on('new-he-said', async so => {
        console.log('got new game request')
        console.log(so)

        const db = new Database()
        await db.connect()

        const checkSql = 'SELECT * FROM Lobbies WHERE GameCode = ?'
        db.db.get(checkSql, [so], (err, data) => {
            if(err) {
                io.sockets.emit('game-created', new ResponseMessage(500, err, "Failed to create a lobby")) 
                db.close()
            }

            console.log('game', data)
            if(data === undefined) {
                const sql = `INSERT INTO Lobbies(GameTypeId, GameCode, GameStatusId, CurrentRound) VALUES(?,?,?,?)`
                db.db.run(sql, [1, so, 1, 1], err => {
                    if(err)
                        io.sockets.emit('game-created', new ResponseMessage(500, err, "Failed to create a lobby"))
                    
                    else
                        io.sockets.emit('game-created', new ResponseMessage(200, null, "Lobby created"))
                        db.close()
                })
            }
            
            else {
                io.sockets.emit('game-currently-open', new ResponseMessage(200, data))
                db.close()
            }
        })
    })

    s.on('check-open-lobby', async so => {
        const context = new Database()
        await context.connect()

        const sql = 'SELECT * FROM Lobbies WHERE GameCode = ?'

        context.db.get(sql, [so], (err, data) => {
            if(err) {
                console.error(error)
                io.sockets.emit('he-said-joined', new ResponseMessage(500, "error", "couldn't join game with code " + so.lobbyCode))
            }
            else {
                io.sockets.emit('he-said-checked', new ResponseMessage(200, data))
            }
        })
    })

    s.on('join-he-said', so => {
        console.log('data be:', so)
        console.log( 'games', games)

        console.log('check', check)
        if(check !== undefined) {
            console.log(s.id + " joined the game")
            io.sockets.emit('he-said-joined', new ResponseMessage(200, socket.id, 'Ok'))
            io.sockets.emit('updated-player-count', new ResponseMessage(200, Math.ceil(Math.random() * 10)), 'OK')
        }
        else io.sockets.emit('he-said-joined', new ResponseMessage(500, "error", "couldn't join game with code " + so.lobbyCode))
    })

    s.on('start-he-said', async so => {
        const context = new Database()
        await context.connect()
        console.log('starting game', so)
        
        const sql = "UPDATE Lobbies SET GameStatusId = 2 WHERE GameCode = ?"
        context.db.run(sql, [so], err => {
            if(err) {
                console.error('got and error', err)
                io.sockets.emit('he-said-started', new ResponseMessage(500, 'Error starting game', 'Error'))
            }
            
            else {
                console.log('Starting game')
                io.sockets.emit('he-said-started', new ResponseMessage(200, 'Game Start', 'OK'))
            }
            
            context.close()
        })
    })

    s.on('respond-he-said', so => {

    })

    s.on('end-he-said', so => {

    })
})
