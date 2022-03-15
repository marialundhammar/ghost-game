/**
 * Socket Controller
 */

const debug = require('debug')('chat:socket_controller');

// list of socket-ids and their username
const player = {};

let io = null;


const handleUserJoined = function (playername, callback) {
    // associate socket id with playername
    playername[this.id] = playername;

    debug(`Player ${playername} with socket id ${this.id} joined`);

    // let everyone know that someone has connected to the game
    this.broadcast.emit('user:connected', playername);

    // confirm join
    callback({
        success: true,
    });

}

const handleDisconnect = function () {
    debug(`Client ${this.id} disconnected :(`);

    // let everyone connected know that user has disconnected
    this.broadcast.emit('player:disconnected', player[this.id]);
    console.log("hej från disconnect")

    // remove user from list of connected users
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