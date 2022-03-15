const socket = io();
const startEl = document.querySelector('#start');
const gameWrapperEl = document.querySelector('#game-board');
const playernameForm = document.querySelector('#playername-form');

let player = null;
let gamesession = null;

// update user list
const updatePlayerList = player => {
    document.querySelector('#player-name-title').innerHTML =
        Object.values(player).map(playername => `<li><span class="fa-solid fa-user-astronaut"></span> ${playername}</li>`).join("");
}

socket.on('players:list', players => {
    updatePlayerList(players);
})


playernameForm.addEventListener('submit', e => {
    e.preventDefault();

    gamesession = playernameForm.game_session_choice.value;

    player = playernameForm.playername.value;

    console.log(`User ${player} wants to join room ${gamesession}'`);


    // emit `user:joined` event and when we get acknowledgement, THEN show the game
    socket.emit('player:joined', player, gamesession, (status) => {
        // we've received acknowledgement from the server
        console.log("Server acknowledged that player joined", status);


        if (status.success) {
            console.log("inside success")
            // hide start view
            startEl.classList.add('hide');

            //show game view 
            gameWrapperEl.classList.remove('hide');

            //changing player-name-title to username 
            document.querySelector('#player-name-title').innerText = player;

            updatePlayerList(status.players);



        }
    });
});