const gamecellFactory = (gamecellHTML) => {
  let playerClaim = undefined;
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
  const reset = () => {
    playerClaim = undefined;
    gamecellHTML.disabled = false;
    gamecellHTML.innerText = '';
  }
  const cell = {gamecellHTML, getClaim, handleClaim, reset}
  return cell
}
const playerFactory = (name, symbol, playerHTML) => {
  let points = 0;
  const setCurrentTurn = (newTurn) => {
    if(newTurn){
        playerHTML.classList.add('currentTurn')
      }else{
        playerHTML.classList.remove('currentTurn')
      }
  }
  const addPoints = (newPoints) => {
    points = points + newPoints;
    playerHTML.querySelector('.points').innerText = `${points} points`
  }
  
  return {name, symbol, setCurrentTurn, addPoints}
}
//IIFE
const gameboard = (() => {
  let currentPlayer = 0;
  let players;
  const HTMLelement = document.querySelector('.gameboard')
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
    setPlayerTurn(1-currentPlayer)

    if (turnHistory.length < 5) {return}

    const winLine = checkWin(gameGrid, cell)

    if (winLine.isWin()) {
      winLine.generatedLines.forEach(element => {
        winStrokeSVG.appendChild(element)
      });
      players[currentPlayer].addPoints(1);
      endGame()
    }else if(turnHistory.length >= 9){
      endGame()
    }

  }
  const setPlayerTurn = (newPlayer) => {
    currentPlayer = newPlayer;

    players[newPlayer].setCurrentTurn(true)
    players[1-newPlayer].setCurrentTurn(false)
  }
  const endGame = () => {
    gameCells.forEach(element => {
      element.gamecellHTML.setAttribute('disabled', 'true')
    });
    const newGameButton = document.createElement('button');
    newGameButton.classList.add('gameboard_newGameButton')
    newGameButton.innerText = "Start New Game"
    newGameButton.addEventListener("click", (event) => {resetGame(event)})
    HTMLelement.appendChild(newGameButton);
  }
  const resetGame = (event) => {
    gameCells.forEach(element => {
      element.reset();
    });
    console.log(event)
    event.srcElement.remove()
    winStrokeSVG.innerHTML = ''
    setPlayerTurn(1-turnHistory[0])
    turnHistory.length = 0
  }
  const checkWin = (grid, cell) => {
    const coords = cell.coordinates
    const player = cell.getClaim()
    const winning = {
      
      wincons: {
        horzwin: false, 
        vertwin: false, 
        diagwin: false, 
        adiagwin: false
        }, 
      generatedLines: [],
      isWin(){return Object.values(this.wincons).includes(true);}
      }

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
      winning.wincons.horzwin = true
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
      winning.wincons.vertwin = true
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
      winning.wincons.diagwin = true;
      }
    }

    //on anti-diag
    if(coords.y == 2 - coords.x){
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
      winning.wincons.adiagwin = true;
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
    
    const pointsHTML = document.createElement('span')
    pointsHTML.classList.add('points')
    pointsHTML.innerText = '0 points';
    newHTML.appendChild(pointsHTML)

    element.replaceWith(newHTML);

    players.push(playerFactory(name, symbol, newHTML))
  });
  return players.reverse();
}