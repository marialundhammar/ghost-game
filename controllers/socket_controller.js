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
const gamesessions = [];

let io = null;
let turns;
let playerClicks = [];
let onlineplayers = [];

//Recieves information when a player clicks the ghost
const handlePlayerPoints = function (playertime, gamesessionid) {
    debug(`This is my time! ${playertime} `);
    debug(`This is the session! ${gamesessionid} `);

    //Save the current players id
    const id = this.id;

    //Push the players id, what turn it is and 
    // the time it took for tyhe player to click on the ghost
    playerClicks.push({ time: playertime, id: id, turn: turns });
    this.emit('player:point', this.id, playertime, turns);
    console.log('playerClicks ', playerClicks);

    // emit your time to the other player
    this.broadcast.to(gamesessionid).emit('player:time', playertime);

    //check if both players clicked on the ghost
    if (playerClicks.length == 2) {
        //add one to turn
        turns++

        //check wich one of the players who are on index 0 (the winner)
        const winningplayer = onlineplayers.find(obj => obj.id === playerClicks[0].id);

        //add one point and the time
        winningplayer['points']++;
        winningplayer['time'] = playertime;

        // emit the winner and the players
        io.to(gamesessionid).emit('player:win', winningplayer, onlineplayers);

        //reset playerclicks
        playerClicks = [];
    }
}

//Handle the player when they join the game
const handleUserJoined = function (playername, turn, callback) {
    // associate socket id with playername
    playername[this.id] = playername;

    // Declare a room id that the player should join.
    let joinRoomId;

    // If onlineplayers are less than two, add the new player
    if (onlineplayers.length < 2) {
        onlineplayers.push({ id: this.id, name: playername, points: 0, time: 0 });
    }

    //save the current turn
    turns = turn;

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
    //reset the online players
    onlineplayers = [];

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

    console.log(gamesession.players)
}


module.exports = function (socket, _io) {
    debug('a new client has connected', socket.id);
    io = _io;

    io.emit("new-connection", "A new user connected");

    // handle player disconnect
    socket.on('disconnect', handleDisconnect);

    // handle player joined
    socket.on('player:joined', handleUserJoined);

    // handle player score
    socket.on('player:points', handlePlayerPoints);

    socket.on('player: delete', handleDisconnect);
}