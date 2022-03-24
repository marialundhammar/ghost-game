/**
 * Socket Controller
 */

const debug = require('debug')('ghost:socket_controller');

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
let io = null;
const gamesessions = [];

//Recieves information when a player clicks the ghost
const handlePlayerPoints = function (playertime, gamesessionid) {
    console.log(`This is my time! ${playertime} `);
    console.log(`This is the session! ${gamesessionid} `);

    const gamesession = gamesessions.find(gamesession => gamesession.id === gamesessionid);
    console.log(gamesession);
    let player = gamesession.players[this.id];


    //Push the players id, what turn it is and 
    // the time it took for tyhe player to click on the ghost

    player = { ...player, time: playertime }
    gamesession.clicks.push({ ...player, id: this.id });

    this.emit('player:point', this.id, gamesession);

    // emit your time to the other player
    this.broadcast.to(gamesessionid).emit('player:time', playertime);

    //check if both players clicked on the ghost
    if (gamesession.clicks.length == 2) {
        console.log("somebody won a turn")
        console.log(gamesession)
        //add one to turn
        gamesession.turn++


        //check wich one of the players who are on index 0 (the winner)
        const winningPlayerId = gamesession.clicks[0].id;
        const currentId = this.id;
        const otherPlayerId = Object.values(gamesession.players).find(obj => obj.id !== this.id).id;
        console.log(otherPlayerId)
        console.log(currentId)
        console.log(gamesession);


        //add one point and the time
        gamesession.players[winningPlayerId].points++
        //

        // emit the winner and the players
        io.to(gamesessionid).emit('player:win', this.id, winningPlayerId, otherPlayerId, gamesession);

        //reset playerclicks
        gamesession.clicks = [];

        console.log(gamesession);
    }
}

//Handle the player when they join the game
const handleUserJoined = function (playername, turn, callback) {
    let joinRoomId;
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
        gamesessions.push({ id: joinRoomId, turn: 0, clicks: [], players: {} });
    }

    // Find the gamesession and add the player to it
    const gamesession = gamesessions.find(obj => obj.id === joinRoomId);
    gamesession.players = { ...gamesession.players, [this.id]: { id: this.id, name: playername, points: 0, time: 0 } }
    console.log(gamesession.players)

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
    //reset the online players
    // onlineplayers = [];

    debug(`Client ${this.id} disconnected :(`);

    const gamesession = gamesessions.find(gamesession => gamesession.players.hasOwnProperty(this.id));

    if (!gamesession) {
        return;
    }

    // let everyone connected know that user has disconnected
    this.broadcast.to(gamesession.id).emit('player:disconnected', gamesession.players[this.id]);
    console.log("hej från disconnect")
    gamesession.turn = 0;
    gamesession.points = 0;



    // remove user from list of connected players
    delete gamesession.players[this.id];
    console.log(gamesession)
    this.broadcast.to(gamesession.id).emit('players:list', gamesession.players);
}


module.exports = function (socket, _io) {
    debug('a new client has connected', socket.id);
    io = _io;

    io.emit("new-connection", "A new user connected");

    // handle player disconnect
    socket.on('disconnect', handleDisconnect);

    // handle player joined
    socket.on('player:joined', handleUserJoined);

    socket.on('player: delete', handleDisconnect);

    // handle player score
    socket.on('player:points', handlePlayerPoints);

    //socket.on('player:kickout', handleDisconnect);
}