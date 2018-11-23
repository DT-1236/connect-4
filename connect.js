/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

window.onload = function() {
  document
    .getElementById('number-select')
    .addEventListener('change', Page.populateColorSelector);

  document
    .getElementById('players')
    .addEventListener('keyup', Page.updateColorSelector);

  document
    .getElementById('new-game')
    .addEventListener('click', Page.startNewGame);
};

class Game {
  constructor(height, width, players) {
    this.height = height;
    this.width = width;
    this.board = this.makeBoard();
    this.playerList = players;
    this.currPlayer = players[0];
    this.handleClick = this.handleClick.bind(this);
    this.top; // Set in makeHtmlBoard
    this.makeHtmlBoard();
  }

  makeBoard() {
    let board = [];
    for (let y = 0; y < this.height; y++) {
      board.push(Array.from({ length: this.width }));
    }
    return board;
  }

  makeHtmlBoard() {
    let boardHTML = document.getElementById('board');
    boardHTML.innerHTML = '';

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.style.backgroundColor = this.currPlayer.color;
    this.top = top;
    top.addEventListener('click', this.handleClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    boardHTML.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      boardHTML.append(row);
    }
  }

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
    this.board[y][x] = this.currPlayer.number;
  }

  endGame(msg) {
    setTimeout(() => alert(msg), 500);
    document
      .getElementById('column-top')
      .removeEventListener('click', this.handleClick);
  }

  handleClick(evt) {
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.placeInTable(y, x);

    let nextPlayerIndex = this.playerList.indexOf(this.currPlayer) + 1;

    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }

    // check for win
    if (this.checkForWin(y, x)) {
      return this.endGame(`Player ${nextPlayerIndex} won!`);
    }

    // switch players
    // this.currPlayer = this.currPlayer === 1 ? 2 : 1;
    this.currPlayer = this.playerList[nextPlayerIndex % this.playerList.length];
    this.top.style.backgroundColor = this.currPlayer.color;
  }

  // Check the 4 possible axes of victory around newly placed piece
  checkForWin(y, x) {
    let axes = this.findAxes(y, x);
    for (let axe of axes) {
      let counter = 0;
      for (let place of axe) {
        if (place === this.currPlayer.number) {
          counter++;
        } else {
          counter = 0;
        }

        if (counter === 4) {
          return true;
        }
      }
    }
  }

  findAxes(y, x) {
    let axes = [];
    // add entire column
    axes.push(this.board[y]);
    // add entire row
    axes.push(
      Array.from(
        { length: this.width - 1 },
        (value, column) => this.board[column][x]
      )
    );
    return axes.concat(this.findDiagonals(y, x));
  }

  // top left is 0,0 - so the y values may be somewhat unintuitive
  findDiagonals(y, x) {
    let diag1 = [];
    let diag2 = [];
    let lowX = x;
    // a higher value is a lower position on the board
    let lowY = y;

    // find the top left to bottom right axe first
    while (lowX > 0 && lowY > 0) {
      lowX--;
      lowY--;
    }
    for (
      lowX, lowY;
      lowX < this.width - 1 && lowY <= this.height - 1;
      lowX++, lowY++
    ) {
      diag1.push(this.board[lowY][lowX]);
    }

    [lowX, lowY] = [x, y];
    // find bottom left to top right axe
    while (lowX > 0 && lowY < this.height - 1) {
      lowX--;
      lowY++;
    }
    for (lowX, lowY; lowX < this.width - 1 && lowY >= 0; lowX++, lowY--) {
      diag2.push(this.board[lowX][lowY]);
    }
    return [diag1, diag2];
  }
}

class Player {
  constructor(color, number) {
    this.color = color;
    this.number = number;
  }
}

class Page {
  static populateColorSelector(event) {
    let value = event.target.value;
    document.getElementById('players').innerHTML = '';
    if (value) {
      let number = +value;
      let form = document.querySelector('form');
      for (let i = 0; i < value; i++) {
        let div = document.createElement('div');
        let label = document.createElement('label');
        label.innerText = `Player ${i + 1} Color:`;
        label.setAttribute('for', `player${i + 1}`);
        div.append(label);
        let colorInput = document.createElement('input');
        colorInput.setAttribute('type', 'text');
        colorInput.setAttribute('name', `player${i + 1}`);
        colorInput.setAttribute('id', `player${i + 1}`);
        let color = getRandomColor();
        colorInput.setAttribute('value', color);
        colorInput.style.backgroundColor = color;
        div.append(colorInput);
        form.append(div);
      }
    }
  }

  static updateColorSelector(event) {
    event.target.style.backgroundColor = event.target.value;
  }

  static startNewGame() {
    let listofPlayers = Array.from(document.querySelectorAll('input')).map(
      (item, index) => new Player(item.value, index + 1)
    );
    let boardGame = new Game(6, 7, listofPlayers);
  }
}

function getRandomColor() {
  let hexes = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += hexes[Math.floor(Math.random() * 16)];
  }
  return color;
}
