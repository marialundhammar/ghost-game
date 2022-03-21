const socket = io();
const startEl = document.querySelector('#start');
const waitingEl = document.querySelector('#waiting-screen')
const gameWrapperEl = document.querySelector('#game-board');
const playernameForm = document.querySelector('#playername-form');


let player = null;
let gamesession = null;

audio = new Audio('/assets/songs/gummibar.mp3');

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
let int;

//get grid width and height
let gridWidth;
let gridHeight;

// update user list
const updateUserList = players => {
    document.querySelector('#online-players').innerHTML =
        Object.values(players).map(player => `<li><span class="fa-solid fa-user-astronaut"></span> ${player}</li>`).join("");
        console.log(players);
        if (Object.keys(players).length == 2) {
            console.log("Two players!");
             
            //hide waiting view
            waitingEl.classList.add('display-none');
            
             //show game view 
            gameWrapperEl.classList.remove('hide');

            gameFunction();
        }
    console.log(players);
    if (Object.keys(players).length == 2) {
        console.log("Two players!");

        //hide start view
        startEl.classList.add('display-none');

        //show game view 
        gameWrapperEl.classList.remove('hide');

        gameFunction();

    }
}

// listen for when we receive an updated list of online users (in this room)
socket.on('players:list', players => {
    updateUserList(players);
})

let gamestatus;
let playerRound = [];

/*
socket.on('next:round', (readystatus, playerid) => {
    gamestatus=readystatus;
    console.log('inside next round, this is the status '+gamestatus)
    console.log('The player who klicked: '+playerid);
})
*/

let playerId;
let currentTurn;


socket.on('player:point', (playerid, playerpoints, turn) => {
    console.log('The player who klicked: ', playerid, "with the time ", playerpoints, "on turn ", turn);
    currentTurn=turn;
    playerId=playerid;
    //let objekt=playerRound.find(obj => obj === playerid);
    //console.log(playerRound)
    //console.log(objekt)

    /*
    if (playerRound.find(obj => obj === playerid)) {
        console.log('Both players clicked!');
        
    } else if(!playerRound.find(obj => obj === playerid)) {
        playerRound.push(playerid);
    }
    */

})


playernameForm.addEventListener('submit', e => {
    e.preventDefault();

    player = playernameForm.playername.value;

    console.log(`User ${player} wants to join`);

    let point=1;


    // emit `user:joined` event and when we get acknowledgement, THEN show the game
    socket.emit('player:joined', player, point, (status) => {
        // we've received acknowledgement from the server
        console.log("Server acknowledged that player joined", status);


        if (status.success) {
            console.log("inside success")
            gamesession = status.gamesession;

             //remove start view
             startEl.classList.add('display-none');

             //show waiting view
             waitingEl.classList.remove('hide');

            //changing player-name-title to username 
            document.querySelector('#player-name-title').innerText = player;

            // update list of users in room
            updateUserList(status.gamesession.players);

        }
    });
});


//TIMER FUNCTIONS
function startTimer() {
  pause();
  startTime = Date.now();

  int = setInterval(function() {
    let elapsedTime = Date.now() - startTime;
    timerDisplay.innerHTML = (elapsedTime / 1000).toFixed(3);
  }, 10)
}
function pause() {
  clearInterval(int);
}

function reset() {
  seconds = 0;
  milliseconds = 0;
  timerDisplay.innerHTML = `00 : 00`;
}

//Function for random number
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

//FUNCTION TO MAKE GHOST APPEAR
function makeGhostAppear() {

   gridWidth = grid.clientWidth - 50;
   gridHeigth = grid.clientHeight - 50;

    //randomize position
    randomTop = getRandomNumber(0, gridHeight);
    randomLeft = getRandomNumber(0, gridWidth)

    console.log("Randomleft: " + randomLeft);

    ghost.style.left = randomLeft + 'px';
    ghost.style.top = randomTop + 'px'

    console.log(ghost);

    //show ghost
    ghost.classList.remove('hide');

    //start timer
    startTimer();
  
    gamestatus = false;
}

let randomDelay = getRandomNumber(0, 5000);

//TIME OUT TO MAKE GHOST APPEAR AFTER FIVE SECONDS
function myTimeout() {
    setTimeout(makeGhostAppear, randomDelay);
}

socket.on('player:win', (winningplayer, loosingplayer, bothplayers) => {
    console.log(winningplayer.name + " won" + " with the time " + winningplayer.time + " current score " + winningplayer.points);

    const myPlayer = bothplayers.find(obj => obj.id === playerId);
    const otherPlayer = bothplayers.find(obj => obj.id !== playerId);
    score1.innerHTML=myPlayer.points+' -';
    score2.innerHTML=otherPlayer.points;

    console.log('This is the player id: '+playerId)
    if (currentTurn<3) {
        reset();
        gameFunction();
    } else {
        alert('game over')
    }
})

const gameFunction = () => {

    getRandomNumber();

    makeGhostAppear();

    // Ghost disappear on click
    ghost.onclick = function () {
        ghost.classList.add('hide');
        
        //pause interval and save the time in timeTAKEN
        //! does not work
        pause();

        let timeTaken = timerDisplay.innerHTML 
        console.log("This is the time taken:", timeTaken);
  


        socket.emit('player:points', timeTaken, gamesession.id);

    }

}
