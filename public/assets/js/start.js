const socket = io();
const startEl = document.querySelector('#start');
const waitingEl = document.querySelector('#waiting-screen')
const gameWrapperEl = document.querySelector('#game-board');
const playernameForm = document.querySelector('#playername-form');
const playAgain = document.querySelector('#playAgain');

const yesBtn = document.querySelector('#yes-btn');
const noBtn = document.querySelector('#no-btn');


let player = null;
let gamesession = null;

audio = new Audio('/assets/songs/gummibar.mp3');

//Countdown
const countdownEl = document.querySelector('#countdown');
const countdownWrapper = document.querySelector('#countdown-wrapper');

//GAME VARIABLES
let start = new Date().getTime();
let time_text = document.getElementById('time-text');
const ghost = document.getElementById("ghost");
const grid = document.querySelector('#thegame');
let theScore = document.getElementById('score');
let score1 = document.getElementById('player1');
let score2 = document.getElementById('player2');


let game = false;


//TIMER FUNCTION
let startTime;
let timerDisplay = document.querySelector('#timer-display');
let timerDisplayTwo = document.querySelector('#timer-display-two');
let int;
let intTwo;

//get grid width and height
let gridWidth;
let gridHeight;

// update user list
const updateUserList = players => {
    document.querySelector('#online-players').innerHTML =
        Object.values(players).map(player => `<li><span class="fa-solid fa-user-astronaut"></span> ${player.name}</li>`).join("");
    console.log(players);
    if (Object.keys(players).length == 2) {
        console.log("Two players!");


        //hide waiting view
        waitingEl.classList.add('display-none');

        //show game view 
        gameWrapperEl.classList.remove('display-none');

        score1.innerHTML = "0 " + " - ";
        score2.innerHTML = "0 ";


        gameFunction();
    }
}

// listen for when we receive an updated list of online users (in this room)
socket.on('players:list', players => {
    updateUserList(players);
})

let gamestatus;
let playerRound = [];
let currentTurn;


socket.on('player:point', (playerid, gamesession) => {
    const turn = gamesession.turn;
    const { name, time } = gamesession.players[playerid];

    console.log('The player who clicked: ', name, "with the time ", time, "on turn ", turn);
    currentTurn = turn;
})


playernameForm.addEventListener('submit', e => {
    e.preventDefault();

    player = playernameForm.playername.value;

    console.log(`User ${player} wants to join`);




    // emit `user:joined` event and when we get acknowledgement, THEN show the game
    socket.emit('player:joined', player, currentTurn, (status) => {
        // we've received acknowledgement from the server
        console.log("Server acknowledged that player joined", status);


        if (status.success) {
            console.log("inside success")
            gamesession = status.gamesession;

            //remove start view
            startEl.classList.add('display-none');

            //show waiting view
            waitingEl.classList.remove('display-none');

            //changing player-name-title to username 
            document.querySelector('#player-name-title').innerText = "🎮 " + player;

            // update list of users in room
            updateUserList(status.gamesession.players);

        }
    });
});



//TIMER FUNCTIONS
function startTimer() {
    pause();
    pauseTwo();
    startTime = Date.now();

    int = setInterval(function () {
        let elapsedTime = Date.now() - startTime;
        timerDisplay.innerHTML = (elapsedTime / 1000).toFixed(3);
        //timerDisplayTwo.innerHTML = (elapsedTime / 1000).toFixed(3);
    }, 10)

    intTwo = setInterval(function () {
        let elapsedTime = Date.now() - startTime;
        //timerDisplay.innerHTML = (elapsedTime / 1000).toFixed(3);
        timerDisplayTwo.innerHTML = (elapsedTime / 1000).toFixed(3);
    }, 10)
}
function pause() {
    clearInterval(int);
}

function pauseTwo() {
    clearInterval(intTwo);
}

function reset() {
    seconds = 0;
    milliseconds = 0;
    timerDisplay.innerHTML = `00 : 00`;
    timerDisplayTwo.innerHTML = `00 : 00`;

}

//Function for random number
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

//FUNCTION TO MAKE GHOST APPEAR
function makeGhostAppear() {

    gridWidth = grid.clientWidth - 50;
    gridHeight = grid.clientHeight - 50;

    //randomize position
    randomTop = getRandomNumber(0, gridHeight);
    randomLeft = getRandomNumber(0, gridWidth)

    console.log("Randomleft: " + randomLeft);

    ghost.style.left = randomLeft + 'px';
    ghost.style.top = randomTop + 'px'

    console.log(ghost);

    //show ghost
    ghost.classList.remove('display-none');

    //start timer
    startTimer();

    gamestatus = false;
}


//TIME OUT TO MAKE GHOST APPEAR AFTER FIVE SECONDS
function myTimeout() {
    setTimeout(makeGhostAppear, randomDelay);
}

socket.on('player:time', (playertime) => {
    console.log('OTHER PLAYER TIME ' + playertime);
    pauseTwo();
    timerDisplayTwo.innerHTML = playertime;

})

socket.on('player:win', (playerId, winningPlayerId, otherPlayerId, gamesession) => {

    const players = gamesession.players;
    const currentPlayer = players[playerId];
    const winningPlayer = players[winningPlayerId];
    const otherPlayer = players[otherPlayerId];

    console.log(winningPlayer.name + " won" + " with the time " + winningPlayer.time + " current score " + winningPlayer.points);

    console.log('THIS IS BOTHPLAYERS', players)

    score1.innerHTML = currentPlayer.points + ' -';
    score2.innerHTML = otherPlayer.points;

    console.log('This is the player id: ' + playerId)
    if (gamesession.turn < 2) {
        reset();
        gameFunction();
    } else {
        playAgain.classList.remove('display-none');
        gameWrapperEl.classList.add('display-none');
        console.log(gamesession.turn)
        gamesession.turn = 2;
    }
})



noBtn.addEventListener('click', e => {
    e.preventDefault();

    socket.emit('player: delete', gamesession);
    playAgain.classList.add('display-none');
    startEl.classList.remove('display-none');

    playernameForm.reset();


});

yesBtn.addEventListener('click', e => {
    e.preventDefault();

    player = playernameForm.playername.value;
    console.log(player);

    // emit `user:joined` event and when we get acknowledgement, THEN show the game
    socket.emit('player:joined', player, currentTurn, (status) => {
        // we've received acknowledgement from the server
        console.log("Server acknowledged that player joined", status);


        if (status.success) {
            console.log("inside success")
            gamesession = status.gamesession;

            //remove start view
            startEl.classList.add('display-none');

            //show waiting view
            waitingEl.classList.remove('display-none');

            //changing player-name-title to username 
            document.querySelector('#player-name-title').innerText = "🎮 " + player;

            // update list of users in room
            updateUserList(status.gamesession.players);

        }
    });

});




const gameFunction = () => {

    makeGhostAppear();

    // Ghost disappear on click
    ghost.onclick = function () {
        ghost.classList.add('display-none');

        //pause interval and save the time in timeTaken
        pause();

        let timeTaken = timerDisplay.innerHTML
        console.log("This is the time taken:", timeTaken);


        socket.emit('player:points', timeTaken, gamesession.id);

    }

}


//Cursor function
// function update(e){
//     var x = e.clientX || e.touches[0].clientX
//     var y = e.clientY || e.touches[0].clientY

//     document.documentElement.style.setProperty('--cursorX', x + 'px')
//     document.documentElement.style.setProperty('--cursorY', y + 'px')
//   }

//   document.addEventListener('mousemove',update)
//   document.addEventListener('touchmove',update)

