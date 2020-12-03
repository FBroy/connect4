const http = require("http");
const express = require("express");
const websocket = require("ws");
const port = process.argv[2];
const app = express();

app.use(express.static(__dirname + "/public"));


const server = http.createServer(app);
const wss = new websocket.Server({ server });

let games = [];
let gameCounter = 0;
let playerCount = 0;
let pendingGame = null;

wss.on("connection", function (socket) {
  currentPlayer = 1;
  lastPlayer = 2;
  playerCount++;
  if (pendingGame === null) {
    pendingGame = {
      id: gameCounter,
      room: "game" + gameCounter,
      player1: socket,
      player2: null,
      board: emptyBoard(),
      nextPlayer: socket,
      finished: false,
    };
    socket.send(JSON.stringify({ type: "startPending" }));
  }
  else {
    pendingGame.player2 = socket;
    games.push(pendingGame);
    pendingGame.player2.send(JSON.stringify({ type: "start", canStart: false }));
    pendingGame.player1.send(JSON.stringify({ type: "start", canStart: true }));
    gameCounter++;
    pendingGame.player1.send(JSON.stringify({ type: "playerFound" }));
    pendingGame.player2.send(JSON.stringify({ type: "playerFound" }));
    pendingGame.player1.send(JSON.stringify({ type: "player", player: 1 }));
    pendingGame.player2.send(JSON.stringify({ type: "player", player: 2 }));
    pendingGame = null;

  }

  socket.on("message", (msg) => {
    console.log(msg);
    var packet = JSON.parse(msg);
    switch (packet.type) {

      case "move":
        makeMove(packet.data, socket);
        break;

      default:
        break;
    }
  });

  socket.on("close", function () {
    if (pendingGame !== null && pendingGame.player1 === socket) {
      console.log("REMOVING GAME");
      pendingGame = null;
      return;
    }

    var game;
    for (let i = 0; i < games.length; i++) {
      if (games[i].player1 === socket || games[i].player2 === socket) {
        game = games[i];
        break;
      }
    }

    if (game === undefined) 
      return;

    if (game.player1 != undefined)
      game.player1.send(JSON.stringify({type: "disconnect"}));

    if (game.player2 != undefined)
      game.player2.send(JSON.stringify({type: "disconnect"}));
    
    games.splice(games.indexOf(game), 1);
    // gameCounter--;
    playerCount-=2;
  });
});

/*init of the board:
  0 for empty, 1 for player 1, 2 for player 2
*/
function emptyBoard() {
  var board = [];
  for (let i = 0; i < 6; i++) {
    board.push([]);
    for (let j = 0; j < 7; j++) {
      board[i].push(0);
    }
  }
  return board;
}

function makeMove(x, socket) {
  for (let m = 0; m < games.length; m++) {
    if (games[m].player1 === socket || games[m].player2 === socket) {
      var game = games[m];
    }
  }
  if (currentPlayer === 1) {
    for (let i = 5; i >= 0; i--) {
      if (game.board[i][Number(x)] === 0) {
        game.board[i][Number(x)] = 1;
        changeColor(i, x, socket, game);
        currentPlayer = 2;
        lastPlayer = 1;
        checkWin(game.board, socket, game);
        break;
      }
    }
  }
  else {
    for (let i = 5; i >= 0; i--) {
      if (game.board[i][Number(x)] === 0) {
        game.board[i][Number(x)] = 2;
        changeColor(i, x, socket, game);
        currentPlayer = 1;
        lastPlayer = 2;
        checkWin(game.board, socket, game);
        break;
      }
    }
  }
}

function changeColor(row, column, socket, game) {
  if (currentPlayer === 1) {
    game.player1.send(JSON.stringify({ type: "colorChange", row: row, column: column, player: currentPlayer }));
    game.player2.send(JSON.stringify({ type: "colorChange", row: row, column: column, player: currentPlayer }));
  }
  else {
    game.player1.send(JSON.stringify({ type: "colorChange", row: row, column: column, player: currentPlayer }));
    game.player2.send(JSON.stringify({ type: "colorChange", row: row, column: column, player: currentPlayer }));
  }

}

function checkWin(board, socket, game) {
  //column = x, row = y

  //horizontal
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 6; i++) {
      if (board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2] && board[i][j] === board[i][j + 3] && (board[i][j] === 1 || board[i][j] === 2)) {
        game.finished = true;
        game.player1.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 1 ? "You won!" : "You lost!" }));
        game.player2.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 2 ? "You won!" : "You lost!" }));
        games.splice(games.indexOf(game), 1);
        playerCount-=2;
        return;
      }
    }
  }

  //vertical
  for (let j = 0; j < 7; j++) {
    for (let i = 0; i < 3; i++) {
      if (board[i][j] === board[i + 1][j] && board[i][j] === board[i + 2][j] && board[i][j] === board[i + 3][j] && (board[i][j] === 1 || board[i][j] === 2)) {
        game.finished = true;
        game.player1.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 1 ? "You won!" : "You lost!" }));
        game.player2.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 2 ? "You won!" : "You lost!" }));
        games.splice(games.indexOf(game), 1);
        playerCount-=2;
        return;
      }
    }
  }

  //diagonal no lenks
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 3; i++) {
      if (board[i][j] === board[i + 1][j + 1] && board[i][j] === board[i + 2][j + 2] && board[i][j] === board[i + 3][j + 3] && (board[i][j] === 1 || board[i][j] === 2)) {
        game.finished = true;
        game.player1.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 1 ? "You won!" : "You lost!" }));
        game.player2.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 2 ? "You won!" : "You lost!" }));
        games.splice(games.indexOf(game), 1);
        playerCount-=2;
        return;
      }
    }
  }

  //diagonal no riets
  for (let j = 3; j < 7; j++) {
    for (let i = 0; i < 3; i++) {
      if (board[i][j] === board[i + 1][j - 1] && board[i][j] === board[i + 2][j - 2] && board[i][j] === board[i + 3][j - 3] && (board[i][j] === 1 || board[i][j] === 2)) {
        game.finished = true;
        game.player1.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 1 ? "You won!" : "You lost!" }));
        game.player2.send(JSON.stringify({ type: "endGame", winner: lastPlayer === 2 ? "You won!" : "You lost!" }));
        games.splice(games.indexOf(game), 1);
        playerCount-=2;
        return;
      }
    }
  }

  //gleichstand
  for (let i = 0; i < 6; i++) {
    if (board[i].includes(0)) {
      if (currentPlayer === 1) {
        game.player1.send(JSON.stringify({ type: "start", canStart: true }));
        break;
      }
      else {
        game.player2.send(JSON.stringify({ type: "start", canStart: true }));
        break;
      }
    }

    else {
      game.finished = true;
      game.player1.send(JSON.stringify({ type: "endGame", winner: "nobody" }));
      game.player2.send(JSON.stringify({ type: "endGame", winner: "nobody" }));
      games.splice(games.indexOf(game), 1);
      playerCount-=2;
      return;
    }
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/splash.html');
  res.render(__dirname + '/views/splash.ejs', {gameCounter: gameCounter, gamesInProgress: games.length, players: playerCount});
});

server.listen(3000, function () {
  console.log("Listening on port 3000.");
});