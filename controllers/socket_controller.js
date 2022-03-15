/**
 * Socket Controller
 */

const debug = require('debug')('chat:socket_controller');

// list of socket-ids and their username
const player = {};
const gamesessions = [
    {
        id: 'noob',
        name: 'Noob',
        players: {}, 
    },
    {
        id: 'veteran',
        name: 'Veteran',
        players: {}, 
    },
    
];

let io = null;


const handleUserJoined = function (playername, gamesession_id, callback) {
    // associate socket id with playername
    playername[this.id] = playername;

    debug(`Player ${playername} with socket id ${this.id} joined session ${gamesession_id} `);

    // join room
	 this.join(gamesession_id);

     // a) find room object with `id` === `general`
	 const gamesession = gamesessions.find(chatroom => chatroom.id === gamesession_id)

     // b) add socket to room's `players` object
	 gamesession.players[this.id] = playername;


    // let everyone know that someone has connected to the game
    this.broadcast.to(gamesession.id).emit('user:connected', playername);

    // confirm join
    callback({
        success: true,
        sessionName: gamesession.name,
		players: gamesession.players
    });

    // broadcast list of users in room to all connected sockets EXCEPT ourselves
	 this.broadcast.to(gamesession.id).emit('players:list', gamesession.players);

}

const handleDisconnect = function () {
    debug(`Client ${this.id} disconnected :(`);

    // let everyone connected know that user has disconnected
    this.broadcast.emit('player:disconnected', player[this.id]);
    console.log("hej från disconnect")

    // remove user from list of connected players
    delete player[this.id];
}


module.exports = function (socket, _io) {
    debug('a new client has connected', socket.id);
    io = _io;

    io.emit("new-connection", "A new user connected");

    // handle user disconnect
    socket.on('disconnect', handleDisconnect);


    // handle user joined
    socket.on('player:joined', handleUserJoined);



}