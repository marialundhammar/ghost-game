/**
 * Socket Controller
 */

const debug = require('debug')('chat:socket_controller');

// list of socket-ids and their username
const player = {};

module.exports = function (socket) {
    debug('a new client has connected', socket.id);

    // handle user disconnect
    socket.on('disconnect', function () {
        debug(`Client ${socket.id} disconnected :(`);

        // let everyone connected know that user has disconnected
        this.broadcast.emit('player:disconnected', player[socket.id]);

        // remove user from list of connected users
        delete player[socket.id];
    });


    // handle user joined
    socket.on('player:joined', function (playername, callback) {
        // associate socket id with username
        playername[socket.id] = playername;

        debug(`Player ${playername} with socket id ${socket.id} joined`);

        // let everyone know that someone has connected to the chat
        socket.broadcast.emit('user:connected', playername);

        // confirm join
        callback({
            success: true,
        });
    });



}