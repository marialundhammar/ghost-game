const grid = document.querySelector('#thegame')
const ghost = document.createElement('div')

//get window width and height
let gridWidth = grid.clientWidth;
let gridHeight = grid.clientHeight;

console.log('Height and width of grid: ' + gridWidth, gridHeight);

//! Risk that the ghost is not fully visible, add inner padding?

//Function for random number
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

//Function to create ghost
function createGhost() {
    grid.appendChild(ghost);
    ghost.classList.add('ghost')

    // get random numbers for each element
    randomTop = getRandomNumber(0, gridHeight);
    randomLeft = getRandomNumber(0, gridWidth)

    ghost.style.left = randomLeft + 'px'
    ghost.style.top = randomTop + 'px'

    //Try to add background image instead?
    ghost.innerText = '👻'

    console.log("Ghost created");
}

createGhost()