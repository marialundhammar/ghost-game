let start = new Date().getTime();
let time_text = document.getElementById('time-text');
const ghost = document.getElementById("ghost");
const grid = document.querySelector('#thegame')

//get grid width and height
let gridWidth = grid.clientWidth-50;
let gridHeight = grid.clientHeight-50;


console.log('Height and width of grid: ' + gridWidth, gridHeight);

 //Function for random number
 function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
  }

//FUNCTION TO MAKE GHOST APPEAR
function makeGhostAppear() {

  //randomize position
  randomTop = getRandomNumber(0, gridHeight);
  randomLeft = getRandomNumber(0, gridWidth)

  console.log("Randomleft: " + randomLeft);

  ghost.style.left = randomLeft + 'px';
  ghost.style.top = randomTop + 'px'

  console.log(ghost);

  //show ghost
  ghost.classList.remove('hide');
  start = new Date().getTime();
}

let randomDelay = getRandomNumber(0, 5000);
//TIME OUT TO MAKE GHOST APPEAR AFTER FIVE SECONDS
function myTimeout() {
  setTimeout(makeGhostAppear, randomDelay);
} 

myTimeout();


// Ghost disappear on click
ghost.onclick = function() {
  ghost.classList.add('hide');
  var end = new Date().getTime();
  var timeTaken = (end - start)/1000; //time in seconds

  console.log(timeTaken);
  time_text.innerHTML = timeTaken + " seconds";

  myTimeout();

}

