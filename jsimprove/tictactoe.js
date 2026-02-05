let gameBoard = [
  [0,0,0],
  [0,0,0],
  [0,0,0]
];
const arraySettings = (JSON.parse(localStorage.getItem('Settings')) || 
["Hard", "Random","Bot","30s","On"]);

let totalScore = (JSON.parse(localStorage.getItem('gameScore')) || {
  win:0,
  lose:0
});


const button = document.querySelectorAll('.button-game');

button.forEach((element)=>{
  element.classList.add('buttonHoverX');
});

let currDifficulty = arraySettings[0];
let currMove = arraySettings[1];
let whoWePlayin = arraySettings[2];
let timeWeHave = (arraySettings[3] === '30s' ? '00:30' : arraySettings[3] === 
  '1min' ? '01:00' : 'inf');
console.log(arraySettings[3]);
let audioOn = arraySettings[4];

function updateScore(check){
  document.querySelector('.scorePlayer').innerText = totalScore.win;
  document.querySelector('.scoreComputer').innerText = totalScore.lose; 
  if(check){
    document.querySelector('.timer-computer').innerText = timeWeHave;
    document.querySelector('.timer-player').innerText = timeWeHave;
  }   
}
updateScore(true);
/*if in move first set bot we need to toogle function of update board*/
function MoveYourAss(){
  if(currMove==='Bot'){
    const nextMove = (currDifficulty==='Easy'?easyLevel():currDifficulty==='Medium'?mediumLevel():computerMove());
    gameBoard[nextMove.i][nextMove.j] = 2;
    updateBoard(nextMove.i*3+nextMove.j);  
  }
  else if(currMove==='Random'){
    const randomnumber = Math.random();
    if(randomnumber >=0.5){
      const nextMove = (currDifficulty==='Easy'?easyLevel():currDifficulty==='Medium'?mediumLevel():computerMove());
      gameBoard[nextMove.i][nextMove.j] = 2;
      updateBoard(nextMove.i*3+nextMove.j);     
    }
  }
}
if(whoWePlayin !== 'Friend') MoveYourAss();

/*Just block hover, play audio, disabled and draw X or O*/
function defaultClick(element, Who){
  element.disabled = true;
  const audio = document.querySelector('.audioOnClick');
  audio.currentTime = 0; 
  if(audioOn === 'On') audio.play();   
  element.classList.remove('buttonHoverX'); 
  element.classList.remove('buttonHoverO'); 
  if(Who === 'X'){
    element.innerHTML = `
    <svg viewBox="0 0 100 100" class="animationLine" xmlns="http://www.w3.org/2000/svg">
    <line x1="90" y1="90" x2="10" y2="10" stroke="black"/>
    <line x1="10" y1="90" x2="90" y2="10" stroke="black"/>
    `;
    element.classList.add('TextX');    
  }
  else{
    element.innerHTML = `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="animationCircle" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke-width="10"/>
      </svg>
    `;    
      element.classList.add('TextO');
  }
}

let firstMoveGame = true;
let Xmoving = firstMoveGame;

button.forEach((element,index) => {
  element.addEventListener('click', ()=>{
    if(whoWePlayin==='Friend'){
      if(Xmoving){
        defaultClick(element,'X');
        gameBoard[Math.floor(index/3)][index%3] = 1;
        if(timeWeHave!='inf') timer('O');
        deleteAndAddHover('O');
        Xmoving = false;
      }
      else{
        defaultClick(element, 'O');
        gameBoard[Math.floor(index/3)][index%3] = 2;
        if(timeWeHave!='inf') timer('X');
        deleteAndAddHover('X');
        Xmoving = true;
      }
    }
    else{
      gameBoard[Math.floor(index/3)][index%3] = 1;
      defaultClick(element,'X');
      if(timeWeHave!='inf') timer('O');
    }
    
    const startInfo = checkForWin(true);
    if(startInfo.winner) {
      updateCssWinner(startInfo);  
      return;
    }    
    if(whoWePlayin==='Bot'){
      const nextMove = (currDifficulty==='Easy'?easyLevel():currDifficulty==='Medium'?mediumLevel():computerMove());
      gameBoard[nextMove.i][nextMove.j] = 2;
      updateBoard(nextMove.i*3+nextMove.j);
      
    }  
  });
});

function deleteAndAddHover(Who){
  button.forEach((element,index)=>{
    const i = Math.floor(index/3);
    const j = index%3;
    if(gameBoard[i][j] === 0){
      if(Who==='X'){
        element.classList.remove('buttonHoverO')
        element.classList.add('buttonHoverX')
      }
      else{
        element.classList.remove('buttonHoverX')
        element.classList.add('buttonHoverO')
      }
    }
  });
}


/*COMPUTER Move && also update table for X*/
function updateBoard(check){
  button.forEach((element, index)=>{
    if(index === check){
      let randomNum = Math.random()*2500;
      randomNum = Math.max(randomNum, 2000);
      blockWhileWaiting(true);
      setTimeout(() =>{
        defaultClick(element,'O');
        if(timeWeHave!='inf') timer('X');

        blockWhileWaiting(false);
        const startInfo = checkForWin(true);
        if(startInfo.winner) updateCssWinner(startInfo);
      },randomNum);
    } 
  });
}

/*Just block some shit while waiting computer move*/
function blockWhileWaiting(block){
  button.forEach((element, index)=>{
    const i = Math.floor(index/3);
    const j = index%3;
    if(block){
      element.disabled = true;
    }
    else{
      if(gameBoard[i][j] === 0) element.disabled = false;
    }
  }); 
}

/*Game end I display shit like who win draw or lose*/
function updateCssWinner(startInfo){
  firstMoveGame = !firstMoveGame;
  Xmoving = firstMoveGame;
  clearInterval(timerId);
  timerId = null;
  const textWinner = document.querySelector('.gameStatusText');
  if(startInfo.winner==='Tie'){
    textWinner.innerText = 'Draw.';
    void textWinner.offsetWidth;
    textWinner.style.animation  = 'epic-appearance';
    textWinner.style.animationDuration = '1s';
    textWinner.classList.add('colorWinnerTie');
  }
  else if(startInfo.winner==='o'){
    totalScore.lose+=1;
    if(whoWePlayin === 'Friend') textWinner.innerText = 'You Win!';
    else textWinner.innerText = 'You Lose!';
    void textWinner.offsetWidth;
    textWinner.style.animation  = 'epic-appearance';
    textWinner.style.animationDuration = '1s';
    textWinner.classList.add('colorWinnerO');
  }
  else{
    totalScore.win+=1;
    textWinner.innerText = 'You win!';
    void textWinner.offsetWidth;
    textWinner.style.animation  = 'epic-appearance';
    textWinner.style.animationDuration = '1s';
    textWinner.classList.add('colorWinnerX');
  }

  updateScore(false);
  localStorage.setItem('gameScore', JSON.stringify(totalScore));
  button.forEach((element,index)=>{
    element.disabled = true;
    element.classList.remove('buttonHoverX');
    element.classList.remove('buttonHoverO');
    if(startInfo.winner==='Tie') return;
    if(startInfo.name === 'rows'){
      if(index>=startInfo.index*3 && index <= ((startInfo.index+1)*3)-1){
        if(startInfo.winner==='o') element.classList.add('moveOfWinnerO');
        else element.classList.add('moveOfWinnerX');
      }
    }
    else if(startInfo.name ==='column'){
      if(index%3==startInfo.index){
        if(startInfo.winner==='o') element.classList.add('moveOfWinnerO');
        else element.classList.add('moveOfWinnerX');
      }
    }
    else if(startInfo === 'diagonal'){
      if(startInfo.index === 0){
        if(index%3 === Math.floor(index/3)) {
          if(startInfo.winner==='o') element.classList.add('moveOfWinnerO');
          else element.classList.add('moveOfWinnerX');
        }  
      }
      else{
        if((index%3 + Math.floor(index/3))===2) {
          if(startInfo.winner==='o') element.classList.add('moveOfWinnerO');
          else element.classList.add('moveOfWinnerX');          
        }
      }
    }
  });
}

let timerId = null;
function timer(whosTurn){
  if(timerId) clearInterval(timerId);
  timerId = setInterval(changeTime, 1000,whosTurn);
}

const changeTime = (whosTurn)=>{
  const classText = (whosTurn === 'X' ? '.timer-player' : '.timer-computer');
  const timerNow = document.querySelector(classText);
  let currTime = Number(timerNow.innerText.substring(0,2))*60+Number(timerNow.innerText.substring(3,5));
  currTime = currTime - 1;
  if(currTime === -1){
    clearInterval(timerId);
    updateCssWinner({
      name: 'time',
      index: -1,
      winner: (whosTurn==='X' ? 'o' : 'x')
    });
    return;
  }
  const tops = Math.floor(currTime/60);
  const bottoms = currTime%60;
  timerNow.innerText = (tops.toString().padStart(2,0)) + ':' + (bottoms.toString().padStart(2,0));
}


function resetAll(){
  restartButton.disabled = true;
  setTimeout(()=>{
    restartButton.disabled = false;
  },1500);
  gameBoard = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ];  
  const textWinner = document.querySelector('.gameStatusText');
  textWinner.classList.remove('colorWinnerO');
  textWinner.classList.remove('colorWinnerX');
  textWinner.classList.remove('colorWinnerTie');
  textWinner.innerText = '';
  textWinner.style.animation = 'none';

  updateScore(true);
  button.forEach((element)=>{
    if(whoWePlayin==='Friend'){
      if(Xmoving){
        element.classList.add('buttonHoverX');
        element.classList.remove('buttonHoverO');      
      }
      else{
        element.classList.add('buttonHoverO');
        element.classList.remove('buttonHoverX');      
      }
    }
    else {
      element.classList.add('buttonHoverX');
      element.classList.remove('buttonHoverO');  
    }  
 
    element.disabled = false;
    element.classList.remove('moveOfWinnerO');
    element.classList.remove('moveOfWinnerX');
    element.innerText ='';
    element.classList.remove('TextO');
    element.classList.remove('TextX');
  });
  if(whoWePlayin!='Friend')MoveYourAss();  
}


/*FOOTER*/
const restartButton = document.querySelector('.restartButton');
restartButton.addEventListener('click', ()=>{ 
  resetAll();
});
const resetButton = document.querySelector('.resetButton');
resetButton.addEventListener('click', ()=>{ 
  totalScore = {
    win:0,
    lose:0
  };
  updateScore();
  localStorage.removeItem('gameScore');
});

document.querySelector('.emojiOpener').addEventListener('click', ()=>{
  const findEmoji = document.querySelector('.model-emoji');
  if(findEmoji.style.display === 'flex'){
    findEmoji.style.display = 'none';
  }
  else findEmoji.style.display = 'flex';
});

document.querySelector('.model-emoji').addEventListener('click', (element)=>{
  const modelemoji = document.querySelector('.model-emoji');
  if(element.target === modelemoji){
    modelemoji.style.display = 'none';
  }
});

const allemoji = document.querySelectorAll('.emojiDisplay');

allemoji.forEach((element) =>{
  element.addEventListener('click', ()=>{
    const findEmoji = document.querySelector('.model-emoji');
    const displayemoji = document.querySelector('.emojiPicked');
    displayemoji.innerHTML = `
    <img src="../emoji/${element.dataset.values}.webp" alt="" class="emojiPicked">
    `;
    findEmoji.style.display = 'none';
    setTimeout(() => {
      displayemoji.innerHTML = '';
    }, 3000);
  });
});

/*
1===Player move
2===Computer move
*/

/*HARD*/

function checkForWin(winnerCout = false){
  for(let i = 0;i < gameBoard.length;i++){
    if(gameBoard[i][0] === gameBoard[i][1] && gameBoard[i][0] === gameBoard[i][2]){
      if(gameBoard[i][0] === 2) {
        if(!winnerCout) return 10;
        return {
          name: 'rows',
          index: i,
          winner: 'o'
        }
      }  
      if(gameBoard[i][0] === 1) {
        if(!winnerCout) return -10;
        return {
          name: 'rows',
          index: i,
          winner: 'x'
        }        
      }  
    }
  }
  for(let i = 0;i < gameBoard.length;i++){
    if(gameBoard[0][i] === gameBoard[1][i] && gameBoard[0][i] === gameBoard[2][i]){
      if(gameBoard[0][i] === 2) {
        if(!winnerCout) return 10;
        return {
          name: 'column',
          index: i,
          winner: 'o'
        }
      }          
      if(gameBoard[0][i] === 1) {
        if(!winnerCout) return -10;
        return {
          name: 'column',
          index: i,
          winner: 'x'
        }
      }  
    }
  }
  if(gameBoard[1][1] === gameBoard[2][2] && gameBoard[1][1] === gameBoard[0][0]){
    if(gameBoard[1][1] === 2) {
      if(!winnerCout) return 10;
      return {
        name: 'diagonal',
        index: 0,
        winner: 'o'
      }
    }
    if(gameBoard[1][1] === 1) {
      if(!winnerCout) return -10;
      return {
        name: 'diagonal',
        index: 0,
        winner: 'x'
        }
    }  
  }
  if(gameBoard[1][1] === gameBoard[0][2] && gameBoard[1][1] === gameBoard[2][0]) {
    if(gameBoard[1][1] === 2) {
      if(!winnerCout) return 10;
      return {
        name: 'diagonal',
        index: 2,
        winner: 'o'
      }
    }
    if(gameBoard[1][1] === 1) {
      if(!winnerCout) return -10;
      return {
        name: 'diagonal',
        index: 2,
        winner: 'x'
      }
    }     
  }
  if(winnerCout){
    if(checkTie()){
      return{
        name: 'none',
        index: 1,
        winner: 'Tie'
      }
    }
  }  
  return 0;
}

function checkTie(){
  for(let i = 0;i < gameBoard.length;i++){
    for(let j = 0; j < gameBoard.length;j++){
      if(gameBoard[i][j]===0) return false;
    }
  }
  return true;
}

function findBestMove(depth, WhoesMove){
  let scoreCurr = checkForWin();
  if(scoreCurr === 10) return scoreCurr-depth;
  
  if(scoreCurr === -10) return scoreCurr+depth;

  if(checkTie()) return 0;

  if(WhoesMove){
    let bestMove = -1000;
    for(let i = 0;i < gameBoard.length;i++){
      for(let j = 0; j < gameBoard.length;j++){
        if(gameBoard[i][j] === 0){

          gameBoard[i][j] = 2;
          let current = findBestMove(depth+1,false);
          gameBoard[i][j] = 0;
          bestMove = Math.max(current,bestMove);
        }
      }
    }
    return bestMove;
  }
  else{
    let bestMove = 1000;
    for(let i = 0;i < gameBoard.length;i++){
      for(let j = 0; j < gameBoard.length;j++){
        if(gameBoard[i][j] === 0){

          gameBoard[i][j] = 1;
          let current = findBestMove(depth+1,true);
          gameBoard[i][j] = 0;
          bestMove = Math.min(current,bestMove);
        }
      }
    }
    return bestMove;
  }
}

function computerMove(){
  let bestVal = -1000;
  let array = [];

  for(let i = 0;i < gameBoard.length;i++){
    for(let j = 0; j < gameBoard.length;j++){
      if(gameBoard[i][j]===0) {
        gameBoard[i][j] = 2;

        let checkVal = findBestMove(0,false);
        gameBoard[i][j] = 0;
        if(checkVal > bestVal){
          bestVal = checkVal;
          array=[{
            i:i,
            j:j
          }];
        }
        else if(checkVal === bestVal){
          array.push({
            i:i,
            j:j
          });
        }
      }
    }
  }  
  const index = Math.round(Math.random()*(array.length-1));
  return array[index];
}

/*MEDIUM*/
function mediumLevel(firstMove = false){
  if(firstMove){
    let check = true;
    button.forEach((element,index)=>{
      const i = Math.floor(index/3);
      const j = index%3;
      if(gameBoard[i][j] !== 0) check = false;
    });
    if(check){
      return array[Math.floor(Math.random()*(array.length-1))];
    }
    else return computerMove();
  }
  else{
    array = [];
    let check = true;
    button.forEach((element,index)=>{
      const i = Math.floor(index/3);
      const j = index%3;
      if((i+j)!==2 && (i!==j)){
        if(gameBoard[i][j] === 2) check = false;
        else if(gameBoard[i][j] === 0) array.push({
          i:i,
          j:j
        });
      }
    });
    if(check){
      return array[Math.floor(Math.random()*(array.length-1))];
    }
    else{
      return computerMove();
    }  
  }  
}

/*EASY*/
function easyLevel(){
  array =[];
  button.forEach((element,index)=>{
    const i = Math.floor(index/3);
    const j = index%3;
    if(gameBoard[i][j] === 0){
      array.push({
        i:i,
        j:j
      });
    }
  });
  return array[Math.floor(Math.random()*(array.length-1))];
}

/*MODAL*/

const SettingsButton = document.querySelector('.SettingsPopUp');
SettingsButton.addEventListener('click', ()=>{
  document.querySelector('.main-model').style.display = 'flex';
});

const buttonSettings = document.querySelectorAll('.button-settings');

buttonSettings.forEach((element,index)=>{
  element.querySelector('span:last-child').innerText = arraySettings[index];
});

buttonSettings.forEach((element,index)=>{

  element.addEventListener('click', ()=>{
    const currName = element.querySelector('.display-element');
    const array = JSON.parse(element.dataset.values);
    const currIndex = array.indexOf(currName.innerText);
    currName.innerText = array[(currIndex+1)%array.length];
    arraySettings[index] = currName.innerText;
    localStorage.setItem('Settings', JSON.stringify(arraySettings));  

    if(array[0] === 'Easy') currDifficulty = currName.innerText;
    if(array[0] === 'You') currMove = currName.innerText;
    if(array[0] === 'Friend') {
      whoWePlayin = currName.innerText;
      resetAll();
    }  
    if(array[0] === '1min') {
      timeWeHave = (currName.innerText === '30s' ? '00:30' : currName.innerText === 
     '1min' ? '01:00' : 'inf');
     updateScore(true);
    }    
    if(array[0] === 'On'){
      audioOn = currName.innerText;
    }


    if(array[0] === 'On'){
      if(currName.innerText === 'On'){
        element.querySelector('span:first-child').innerHTML = `
        <i class="fas fa-volume-high"></i>
        `;
        element.querySelector('span:last-child').classList.add('display-elementOn');
        element.querySelector('span:last-child').classList.remove('display-elementOff');
      }
      else{
        element.querySelector('span:first-child').innerHTML = `
        <i class="fas fa-volume-off"></i>
        `;              
        element.querySelector('span:last-child').classList.add('display-elementOff');
        element.querySelector('span:last-child').classList.remove('display-elementOn');
      }
    }
    if(array[0] === 'Friend'){
      if(currName.innerText === 'Friend'){
        element.querySelector('span:first-child').innerHTML = `
        <i class="fas fa-user"></i>
        `;
      }
      else{
        element.querySelector('span:first-child').innerHTML = `
        <i class="fas fa-robot"></i>
        `;              
      }
    }
  });

  /*update color of "ON OFF" "Eeasy med hard" on open settings*/
  const textSettings = element.querySelector('span:last-child');
  if(textSettings.innerText === 'On'){
    element.querySelector('span:first-child').innerHTML = `
    <i class="fas fa-volume-high"></i>
    `;    
    textSettings.classList.add('display-elementOn');
    textSettings.classList.remove('display-elementOff');
  }  
  else if(textSettings.innerText === 'Off'){
    element.querySelector('span:first-child').innerHTML = `
    <i class="fas fa-volume-off"></i>
    `;      
    textSettings.classList.add('display-elementOff');  
    textSettings.classList.remove('display-elementOn');  
  }
  if(textSettings.innerText === 'Friend'){
    element.querySelector('span:first-child').innerHTML = `
    <i class="fas fa-user"></i>
    `; 
  }
  else if(textSettings.innerText === 'Bot'){
    element.querySelector('span:first-child').innerHTML = `
    <i class="fas fa-robot"></i>
    `;                  
  }  
});

/*Closing modal*/
const close = document.querySelector('.close-button');
close.addEventListener('click',()=>{
  document.querySelector('.main-model').style.display = 'none';
});

document.querySelector('.main-model').addEventListener('click',(element)=>{
  const closeShitModel = document.querySelector('.main-model');
  if(element.target === closeShitModel){
    closeShitModel.style.display = 'none';
  }
});