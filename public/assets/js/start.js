

const startEl = document.querySelector('#start');
const gameWrapperEl = document.querySelector('#game-wrapper');
const playernameForm = document.querySelector('#playername-form');


//let room = null;
let player = null;

// get username and room from form and emit `user:joined` and then show chat
playernameForm.addEventListener('submit', e => {
    e.preventDefault();

    //room = playernameForm.room.value;
    username = playernameForm.player.value;

    console.log(`User ${player} wants to join room'`);

    // emit `user:joined` event and when we get acknowledgement, THEN show the chat
    socket.emit('user:joined', player, (status) => {
        // we've received acknowledgement from the server
        console.log("Server acknowledged that user joined", status);

        if (status.success) {
            // hide start view
            startEl.classList.add('hide');

            // show chat view
            gameWrapperEl.classList.remove('hide');

            // set room name as chat title
            document.querySelector('#game-title').innerText = player;


        }
    });
});