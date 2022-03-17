/**
 * Socket Controller
 */

const debug = require('debug')('chat:socket_controller');

//generate a id for the room
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

// Create an empty array of gamesessions that will be populated as players join.
const gamesessions = [];

let io = null;


const handleUserJoined = function (playername, callback) {
    // associate socket id with playername
    playername[this.id] = playername;
    // Declare a room id that the player should join.
    let joinRoomId;

    debug(`Player ${playername} with socket id ${this.id} joined`);

    // Loop through gamesessions to find an empty room
    gamesessions.forEach((gamesession) => {
        // Get the count of players in the room
        const clients = this.adapter.rooms.get(gamesession.id);
        const numClients = clients ? clients.size : 0;
        // If there are less than 2 players in a room, set the id to join to that room.
        if (numClients < 2) {
            joinRoomId = gamesession.id;
        } 
    })

    // If no empty room found, create a new one and add to gamesession array.
    if (!joinRoomId) {
        joinRoomId = makeid(5);
        gamesessions.push({ id: joinRoomId, players: {} });
    }

    // Find the gamesession and add the player to it
    const gamesession = gamesessions.find(obj => obj.id === joinRoomId);
    gamesession.players = { ...gamesession.players, [this.id]: playername }

    // Create or join an existing room with the joinRoomId.
    this.join(joinRoomId);

    // confirm join
    callback({
        success: true,
        gamesession
    });

    // broadcast list of users in room to all connected sockets EXCEPT ourselves
    this.broadcast.to(joinRoomId).emit('players:list', gamesession.players);

}


const handleDisconnect = function () {
    debug(`Client ${this.id} disconnected :(`);

    const gamesession = gamesessions.find(gamesession => gamesession.players.hasOwnProperty(this.id));

    if (!gamesession) {
        return;
    }

    // let everyone connected know that user has disconnected
    this.broadcast.emit('player:disconnected', gamesession.players[this.id]);
    console.log("hej från disconnect")


    // remove user from list of connected players
    delete gamesession.players[this.id];

    this.broadcast.to(gamesession.id).emit('players:list', gamesession.players);

    //If a user disconnect end game! 
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