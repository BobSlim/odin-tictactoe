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
  const winStrokeSVG = document.querySelector(".winStroke")
  const turnHistory = [];
  const gameCells = [...document.getElementsByClassName("gamecell")].map(element => gamecellFactory(element));
  gameCells.forEach(element => {
    element.gamecellHTML.addEventListener('click', () => playerClaim(element))
  });

  const playerClaim = (cell) => {
    if(players == undefined){players = initPlayers()};
    cell.handleClaim(players[currentPlayer]);
    
    turnHistory.push(currentPlayer)
    currentPlayer = 1 - currentPlayer;

    players[currentPlayer].setCurrentTurn(true)
    players[1-currentPlayer].setCurrentTurn(false)
    
    if (turnHistory.length < 5) {
      return
    }
    const winLine = checkWin(gameGrid, cell)
    if(!winLine && turnHistory.length >= 9){
      console.log('draw!')
    }
    winLine.generatedLines.forEach(element => {
      winStrokeSVG.appendChild(element)
    });
  }
  const checkWin = (grid, cell) => {
    const coords = cell.coordinates
    const player = cell.getClaim()
    const winning = {horzwin: false, vertwin: false, diagwin: false, adiagwin: false, generatedLines: []}

    const lineParams = {
      startOffset: 60,
      extraOffset: 112,
      endLine: 344,
      color: "black",
      width: "10"
    }

    const generateLine = (coords) => {
      let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      newLine.setAttribute("x1", coords.x1)
      newLine.setAttribute("x2", coords.x2)
      newLine.setAttribute("y1", coords.y1)
      newLine.setAttribute("y2", coords.y2)
      newLine.setAttribute("stroke", lineParams.color)
      newLine.setAttribute("stroke-width", lineParams.width)
      return newLine;
    }

    horzcheck: {
      for (let x = 0; x < grid[coords.y].length; x++) {
        const element = grid[coords.y][x];
        if(element.getClaim() !== player){break horzcheck};
      }
      const newLineCoords = {
        x1: "0",
        x2: String(lineParams.endLine),
        y1: lineParams.startOffset + lineParams.extraOffset*coords.y,
        y2: lineParams.startOffset + lineParams.extraOffset*coords.y
      }
      winning.generatedLines.push(generateLine(newLineCoords))
      winning.horzwin = true
    }

    vertcheck: {
      for (let y = 0; y < grid.length; y++) {
        const element = grid[y][coords.x];
        if(element.getClaim() !== player){break vertcheck;};
      }
      const newLineCoords = {
        x1: lineParams.startOffset + lineParams.extraOffset*coords.x,
        x2: lineParams.startOffset + lineParams.extraOffset*coords.x,
        y1: "0",
        y2: String(lineParams.endLine),
      }
      winning.generatedLines.push(generateLine(newLineCoords))
      winning.vertwin = true
    }

    //on diag
    if(coords.y == coords.x){
      diagcheck: {for (let y = 0; y < grid.length; y++) {
        const element = grid[y][y];
        if(element.getClaim() !== player){break diagcheck;};
      }
      const newLineCoords = {
        x1: "0",
        x2: String(lineParams.endLine),
        y1: "0",
        y2: String(lineParams.endLine),
      }
      winning.generatedLines.push(generateLine(newLineCoords))
      winning.diagwin = true;
      }
    }

    //on anti-diag
    if(coords.y == coords.x - 2){
      adiagcheck: {for (let y = 0; y < grid.length; y++) {
        const element = grid[y][2-y];
        if(element.getClaim() !== player){break adiagcheck;};
      }
      const newLineCoords = {
        x1: "0",
        x2: String(lineParams.endLine),
        y1: String(lineParams.endLine),
        y2: "0"
      }
      winning.generatedLines.push(generateLine(newLineCoords))
      winning.adiagwin = true;
      }
    }
  return winning;
  }
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