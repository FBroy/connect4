window.onload = function () {

    var turn = false;
    var timer = 0;
    setInterval(function(){
        timer++;
        if (Math.floor(timer/60) < 10 && timer%60 < 10) {
            document.getElementById("time").textContent = "Elapsed time: 0" + Math.floor(timer/60) + ":0" + timer%60;
        }
        else if (Math.floor(timer/60) < 10 && timer%60 >= 10) {
            document.getElementById("time").textContent = "Elapsed time: 0" + Math.floor(timer/60) + ":" + timer%60;
        }
        else if (Math.floor(timer/60) >= 10 && timer%60 < 10) {
            document.getElementById("time").textContent = "Elapsed time: " + Math.floor(timer/60) + ":0" + timer%60;
        }
        else {
            document.getElementById("time").textContent = "Elapsed time: " + Math.floor(timer/60) + ":" + timer%60;
        }
    }, 1000);

    window.onresize = function() {
        if (window.innerHeight < 700 || window.innerWidth < 1000) {
            alert("Your resolution is too low, the minimal resolution is 1000x700");
        }
    };

    let socket = new WebSocket("ws://145.94.158.8:3000");

    socket.onopen = function (event) {
        // socket.send("Hi");
    };

    socket.onmessage = function (message) {
        console.log(message.data);
        var packet = JSON.parse(message.data);
        console.log(packet.type);
        switch (packet.type) {

            case "startPending":
                console.log("Pending");
                break;

            case "playerFound":
                document.getElementById("overlay").style.visibility = "hidden";
                break;
            
            case "start":
                console.log("Start");
                if (packet.canStart) {
                    console.log("makeMove");
                    turn = true;
                }
                break;
            
            case "player":
                if (packet.player === 1) {
                    alert("You are player 1 (red)");
                }
                else {
                    alert("You are player 2 (yellow)");
                }
                timer = 0;
                break;

            case "colorChange":
                console.log("colorChange");
                changeColor(packet.row, packet.column, packet.player);
                break;

            case "endGame":
                setTimeout(() => {
                    alert(packet.winner);
                    console.log("AFTER ALERT");
                    window.location.href = "/";
                }, 1000);
                break;

            case "disconnect":
                setTimeout(() => {
                    alert("The other player disconnected...");
                    console.log("The other player disconnected...");
                    window.location.href = "/";
                }, 1000);
                break;

            default:
                break;
        }
    }

    var fields = document.getElementsByClassName("dot");
    for (var i = 0; i < fields.length; i++) {
        /*switch color function and after win check */
        const f = fields[i];
        f.addEventListener('click', function (event) {
            makeMove(Number(f.parentNode.id));
        });
    }

    function makeMove(column) {
        if (!turn) {
            return;
        }
        socket.send(JSON.stringify({ type: "move", data: column }));
        turn = false;
    }

    function changeColor(row, column, player) {
        if (player === 1) {
            document.getElementById(column.toString()).children[row.toString()].style.backgroundColor = 'red';
            document.getElementById("image").style.top = 64 + "%";
            document.getElementById("image").style.animationName = "resize2";
        }
        else {
            document.getElementById(column.toString()).children[row.toString()].style.backgroundColor = 'yellow';
            document.getElementById("image").style.top = 14 + "%";
            document.getElementById("image").style.animationName = "resize1";
        }

    }



    // /*init of the board:
    //     0 for empty, 1 for player 1, 2 for player 2
    // */
    // var board = [];
    // for (let i = 0; i < 6; i++) {
    //     board.push([]);
    //     for (let j = 0; j < 7; j++) {
    //         board[i].push(0);
    //     }
    // }
    // var currentPlayer = 1;
    // var lastPlayer = 2;

    // function makeMove(x) {
    //     if (currentPlayer === 1) {
    //         for (let i = 5; i >= 0; i--) {
    //             if (board[i][Number(x)] === 0) {
    //                 board[i][Number(x)] = 1;
    //                 changeColor(i, x);
    //                 currentPlayer = 2;
    //                 lastPlayer = 1;
    //                 break;
    //             }
    //         }
    //     }
    //     else {
    //         for (let i = 5; i >= 0; i--) {
    //             if (board[i][Number(x)] === 0) {
    //                 board[i][Number(x)] = 2;
    //                 changeColor(i, x);
    //                 currentPlayer = 1;
    //                 lastPlayer = 2;
    //                 break;
    //             }
    //         }
    //     }
    //     checkWin(board);
    // }

    // function changeColor(row, column) {
    //     if (currentPlayer === 1) {
    //         document.getElementById(column.toString()).children[row.toString()].style.backgroundColor = 'red';
    //     }
    //     else {
    //         document.getElementById(column.toString()).children[row.toString()].style.backgroundColor = 'yellow';
    //     }

    // }

    // function checkWin() {
    //     //column = x, row = y

    //     console.log(board);
    //     //horizontal
    //     for (let j = 0; j < 4; j++) {
    //         for (let i = 0; i < 6; i++) {
    //             if (board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2] && board[i][j] === board[i][j+3] && (board[i][j] === 1 || board[i][j] === 2)) {
    //                 setTimeout(function(){ alert("Player " + lastPlayer + " won!"); }, 300);
    //                 console.log("Player " + lastPlayer + " won!  --> horizontal");
    //             }
    //         }
    //     }

    //     //vertical
    //     for (let j = 0; j < 7; j++) {
    //         for (let i = 0; i < 3; i++) {
    //             if (board[i][j] === board[i + 1][j] && board[i][j] === board[i + 2][j] && board[i][j] === board[i + 3][j] && (board[i][j] === 1 || board[i][j] === 2)) {
    //                 setTimeout(function(){ alert("Player " + lastPlayer + " won!"); }, 300);
    //                 console.log("Player " + lastPlayer + " won!  --> vertical");
    //             }
    //         }
    //     }

    //     //diagonal no lenks
    //     for (let j = 0; j < 4; j++) {
    //         for (let i = 0; i < 3; i++) {
    //             // console.log(i + ", " + j);
    //             if (board[i][j] === board[i + 1][j + 1] && board[i][j] === board[i + 2][j + 2] && board[i][j] === board[i + 3][j + 3] && (board[i][j] === 1 || board[i][j] === 2)) {
    //                 setTimeout(function(){ alert("Player " + lastPlayer + " won!"); }, 300);
    //                 console.log("Player " + lastPlayer + " won!  --> diagonal no lenks");
    //             }
    //         }
    //     }

    //     // //diagonal no riets
    //     // for (let j = 3; j < 7; j++) {
    //     //     for (let i = 0; i < 4; i++) {
    //     //         if (board[i][j - 3] === board[i + 1][j - 2] === board[i + 2][j - 1] === board[i + 3][j + 3] === 1 || board[i][j] === board[i + 1][j + 1] === board[i + 2][j + 2] === board[i + 3][j + 3] === 2) {
    //     //             setTimeout(function(){ alert("Player " + lastPlayer + " won!"); }, 300);
    //     //             console.log("Player " + lastPlayer + " won!  --> diagonal no riets");
    //     //         }
    //     //     }
    //     // }

    //     //gleichstand
    //     for (let i = 0; i < 6; i++) {
    //         if (board[i].includes(0)) {
    //             console.log("Nothing happens...");
    //             break;
    //         }

    //         else {
    //             setTimeout(function(){ alert("Player " + lastPlayer + " won!"); }, 300);
    //             console.log("It's a tie");
    //             break;
    //         }
    //     }
    // }

    // var fields = document.getElementsByClassName("dot");
    // for (var i = 0; i < fields.length; i++) {
    //     /*switch color function and after win check */
    //     const f = fields[i];
    //     f.addEventListener('click', function (event) {
    //         makeMove(f.parentNode.id);
    //     });
    // }
};