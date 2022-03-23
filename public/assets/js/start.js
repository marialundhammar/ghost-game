const socket = io();
const startEl = document.querySelector('#start');
const waitingEl = document.querySelector('#waiting-screen')
const gameWrapperEl = document.querySelector('#game-board');
const playernameForm = document.querySelector('#playername-form');


let player = null;
let gamesession = null;

audio = new Audio('/assets/songs/gummibar.mp3');

//Countdown
const countdownEl = document.querySelector('#countdown');
const countdown = ['Ready..', 'Set..', 'GHOST!'];


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
        Object.values(players).map(player => `<li><span class="fa-solid fa-user-astronaut"></span> ${player}</li>`).join("");
        console.log(players);
        if (Object.keys(players).length == 2) {
            console.log("Two players!");
             
            //hide waiting view
            waitingEl.classList.add('display-none');
            
             //show game view 
            gameWrapperEl.classList.remove('hide');

            //Countdown before game starts
            var interval = 1000; // countdown delay time
                countdown.forEach(function (el, index) {
                setTimeout(function () {
                    countdownEl.innerHTML = el;
                    console.log(el);
                    console.log("Inner html:", countdownEl.innerHTML);
                }, index * interval);
            });

            //Hide countdown before game starts
            setTimeout(function () {
                countdownEl.innerHTML = "";
                countdownEl.classList.add("display-none");
            }, 3000);

            //Start game
            gameFunction();
        }
}

// listen for when we receive an updated list of online users (in this room)
socket.on('players:list', players => {
    updateUserList(players);
})

let gamestatus;
let playerRound = [];


let playerId;
let currentTurn;


socket.on('player:point', (playerid, playerpoints, turn) => {
    console.log('The player who klicked: ', playerid, "with the time ", playerpoints, "on turn ", turn);
    currentTurn=turn;
    playerId=playerid;
})


playernameForm.addEventListener('submit', e => {
    e.preventDefault();

    player = playernameForm.playername.value;

    console.log(`User ${player} wants to join`);

    let turn=1;


    // emit `user:joined` event and when we get acknowledgement, THEN show the game
    socket.emit('player:joined', player, turn, (status) => {
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

  int = setInterval(function() {
    let elapsedTime = Date.now() - startTime;
    timerDisplay.innerHTML = (elapsedTime / 1000).toFixed(3);
    //timerDisplayTwo.innerHTML = (elapsedTime / 1000).toFixed(3);
  }, 10)

  intTwo = setInterval(function() {
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
    setTimeout(function() {
        timerDisplay.innerHTML = `00 : 00`;
        timerDisplayTwo.innerHTML = `00 : 00`;
    }, 3000)
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
    ghost.classList.remove('hide');

    //start timer
    startTimer();
  
    gamestatus = false;
}


socket.on('player:time', (playertime) => {
    console.log('OTHER PLAYER TIME '+playertime);
    pauseTwo();
    timerDisplayTwo.innerHTML=playertime;

})

socket.on('player:win', (winningplayer, bothplayers) => {
    console.log(winningplayer.name + " won" + " with the time " + winningplayer.time + " current score " + winningplayer.points);


    //console.log('THIS IS THE LOOSER', loosingplayer)
    console.log('THIS IS BOTHPLAYERS', bothplayers)

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

     //Delay for ghost
     setTimeout(makeGhostAppear, 3000);

    // Ghost disappear on click
    ghost.onclick = function () {
        ghost.classList.add('hide');
        
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
  
