const gamecellFactory = (gamecellHTML) => {
  let playerClaim = 'init';
  const coordinates = {
    y: 0,
    x: 0
  }
  const handleClaim = (player) => {
    gamecellHTML.setAttribute('disabled', 'true')
    gamecellHTML.innerText = player.symbol;
    playerClaim = player;
  }
  const getClaim = () =>{
    return playerClaim;
  }
  const cell = {gamecellHTML, getClaim, handleClaim}
  return cell
}
const playerFactory = (name, symbol, playerHTML) => {
  const setCurrentTurn = (newTurn) => {
    if(newTurn){
        playerHTML.classList.add('currentTurn')
      }else{
        playerHTML.classList.remove('currentTurn')
      }
  }
  
  return {name, symbol, setCurrentTurn}
}
//IIFE
const gameboard = (() => {
  let currentPlayer = 0;
  let players;
  let turnCount = 0;
  let firstTurn;
  const playerClaim = (cell) => {
    if(players == undefined){players = initPlayers()};
    if(turnCount == 0){firstTurn = currentPlayer};
    cell.handleClaim(players[currentPlayer]);
    
    if (currentPlayer == 0) {
      currentPlayer = 1
    } else {
      currentPlayer = 0
    }

    players[currentPlayer].setCurrentTurn(true)
    players[1-currentPlayer].setCurrentTurn(false)
    
    turnCount++
    if (turnCount >= 4) {
      console.log(checkWin(gameGrid, cell))
    } else if(turnCount == 8){
      console.log('draw!')
    }
  }
  const checkWin = (grid, cell) => {
    const coords = cell.coordinates
    const player = cell.getClaim()
    const winning = {horzwin: false, vertwin: false, diagwin: false}

    horzcheck: {
      for (let x = 0; x < grid[coords.y].length; x++) {
        const element = grid[coords.y][x];
        if(element.getClaim() !== player){break horzcheck};
      }
      winning.horzwin = true
    }

    vertcheck: {
      for (let y = 0; y < grid.length; y++) {
        const element = grid[y][coords.x];
        if(element.getClaim() !== player){break vertcheck;};
      }
      winning.vertwin = true
    }

    //on diag
    if(coords.y == coords.x){
      diagcheck: {for (let y = 0; y < grid.length; y++) {
        const element = grid[y][y];
        if(element.getClaim() !== player){break diagcheck;};
      }
      winning.diagwin = true;
      }
    }

    //on anti-diag
    if(coords.y == coords.x - 2){
      adiagcheck: {for (let y = 0; y < grid.length; y++) {
        const element = grid[y][2-y];
        if(element.getClaim() !== player){break adiagcheck;};
      }
      winning.diagwin = true;
      }
    }

  return winning;
  }
  const gameCells = [...document.getElementsByClassName("gamecell")].map(element => gamecellFactory(element));
  gameCells.forEach(element => {
    element.gamecellHTML.addEventListener('click', () => playerClaim(element))
  });
  //IIFE
  const gridifyCells = (cells) => {
    const coords = {y: 0, x: 0};
    const grid_init = [[],[],[]]
    gameCells.forEach(element => {
      element.coordinates = {...coords};
      grid_init[coords.y][coords.x] = element;
      coords.x++
      if(coords.x >= 3){coords.y++; coords.x=0};
    });
    return grid_init;
  }

  const gameGrid = gridifyCells(gameCells)
  console.log(gameGrid)
})()

const initPlayers = () => {    
  const playerPanels = [...document.querySelectorAll('.playerpanel')]
  const players = []
  playerPanels.forEach(element => {
    const HTML_name = element.querySelectorAll('.playerpanel_name');
    const HTML_symbol = element.querySelector('.playerpanel_symbol');
    const name = HTML_name[0].value;
    const symbol = HTML_symbol.value;
    
    const newHTML = document.createElement('span')
    newHTML.classList.add('playerpanel_name')
    newHTML.classList.add('playerpanel')
    newHTML.innerText = `${name} - ${symbol}`

    element.replaceWith(newHTML);

    players.push(playerFactory(name, symbol, newHTML))
  });
  return players.reverse();
}