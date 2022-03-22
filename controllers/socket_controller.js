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
let pointtracker;

let pointCheck = [];
let trackerofpoints = [];
let onlineplayers=[];

const handlePlayerPoints = function (playertime, gamesessionid) {
    debug(`This is my time! ${playertime} `);
    debug(`This is the session! ${gamesessionid} `);

    //Den som är på index 0 vinner 

    const id = this.id;
    //let point=0;

    pointCheck.push({ time: playertime, id: id, point: pointtracker });
    this.emit('player:point', this.id, playertime, pointtracker);
    console.log(pointCheck);

    // emit `chat:message` event to everyone EXCEPT the sender
	this.broadcast.to(gamesessionid).emit('player:time', playertime);


    //playerpoints[this.id]=playerpoints; 
    if (pointCheck.length == 2) {
        
        function getOccurrence(array, value) {
            var count = 0;
            array.forEach((v) => (v === value && count++));
            return count;
        }

        pointtracker++

        console.log('pointtracker', pointtracker)
        
        //trackerofpoints.push(pointCheck[0].id);
        const winningplayer = onlineplayers.find(obj => obj.id === pointCheck[0].id);
        winningplayer['points']++;
        winningplayer['time']=playertime;

        const loosingplayer = onlineplayers.find(obj => obj.id === pointCheck[1].id);

        console.log('online players', onlineplayers);

        console.log('winning player', winningplayer);

        io.to(gamesessionid).emit('player:win', winningplayer, loosingplayer, onlineplayers);
        //this.emit('player:looser', pointCheck[1]);
        console.log('This is tracker of points ',trackerofpoints);

        console.log('This is the id ',this.id);

        console.log('new round should start');
        pointCheck = [];
        console.log("end of round", true)
    }





}


const handleUserJoined = function (playername, point, callback) {
    // associate socket id with playername
    playername[this.id] = playername;
    // Declare a room id that the player should join.
    let joinRoomId;

    if (onlineplayers.length<2) {
        onlineplayers.push({id: this.id, name: playername, points: 0, time: 0}); 
    }

    pointtracker=point;

    debug(`Player ${playername} with socket id ${this.id} joined`);
    console.log('This is the initial online players', onlineplayers);
    console.log('Length of online', onlineplayers.length);

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
    onlineplayers=[];
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
    trackerofpoints=[];
}


module.exports = function (socket, _io) {
    debug('a new client has connected', socket.id);
    io = _io;

    io.emit("new-connection", "A new user connected");

    // handle user disconnect
    socket.on('disconnect', handleDisconnect);


    // handle user joined
    socket.on('player:joined', handleUserJoined);

    socket.on('player:points', handlePlayerPoints);



}