const socket = io();
const startEl = document.querySelector('#start');
const gameWrapperEl = document.querySelector('#game-board');
const playernameForm = document.querySelector('#playername-form');

let player = null;

playernameForm.addEventListener('submit', e => {
    e.preventDefault();

    player = playernameForm.playername.value;

    console.log(`User ${player} wants to join room'`);


    // emit `user:joined` event and when we get acknowledgement, THEN show the game
    socket.emit('player:joined', player, (status) => {
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



        }
    });
});