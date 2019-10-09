import React from 'react';
import './App.css';

const MOVE_HISTORY = "chess_move_history";

function makeBoard() {
  return [
    ['♜','♞','♝','♚','♛','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♔','♕','♗','♘','♖']
  ];
}

export default class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      moves: localStorage.getItem(MOVE_HISTORY) || "",
    }
  }

  componentDidUpdate () {
    localStorage.setItem(MOVE_HISTORY, this.state.moves);
  }

  render () {
    const board = doMoves(makeBoard(), this.state.moves);

    return (
      <div className="App">
        <table className="App-Board">
          <tbody>
          {
            board.map((rank,rankNumber) => (
              <tr key={rankNumber + 1}>
                {
                  rank.map((piece, fileNumber) => {
                    const className = (rankNumber % 2 + fileNumber) % 2 ? "black-square" : "white-square";
                    return <td key={fileNumberToName(fileNumber)} className={className}>{piece}</td>;
                  })
                }
              </tr>
            ))
          }
          </tbody>
        </table>
        <textarea className="App-moves" value={this.state.moves} onChange={e=>this.setState({ moves: e.target.value })} />
      </div>
    );
  }
}

/** @param {number} fileNumber */
function fileNumberToName (fileNumber) {
  return String.fromCharCode(0x61 + fileNumber);
}

/** @param {string} fileName */
function fileNameToNumber (fileName) {
  return fileName.charCodeAt(0) - 0x61;
}

/** @param {number} rankNumber */
function rankNumberToName (rankNumber) {
  return String(8 - rankNumber);
}

/** @param {string} rankName */
function rankNameToNumber (rankName) {
  return 8 - +rankName;
}

function pieceNameToSymbol (pieceName, black=false) {
  switch (pieceName) {
    case "K": return black ? "♛" : "♕";
    case "Q": return black ? "♚" : "♔";
    case "B": return black ? "♝" : "♗";
    case "N": return black ? "♞" : "♘";
    case "R": return black ? "♜" : "♖";
    default: return black ? "♟" : "♙";
  }
}

function doMoves (board, moves) {
  const re = /^\d+\. *([^ ]+)(?: +([^ ]+))?/
  const moveList = moves.split("\n").filter(m => re.test(m));

  try {
    for (const move of moveList) {
      const [ _, whiteMove, blackMove] = re.exec(move);

      movePiece(board, whiteMove, false);

      if (blackMove) {
        movePiece(board, blackMove, true);
      }
    }
  } catch (e) {
    console.error(e);
  }

  return board;
}

const reMove = /([KQBNR]?)([a-h]?)([1-8]?)([a-h])([1-8])/;
function movePiece (board, move, isBlack=false) {
  if (reMove.test(move)) {
    let [__, piece, fromFileName, fromRankName, toFileName, toRankName] = reMove.exec(move);

    const symbol = pieceNameToSymbol(piece, isBlack);

    if (!fromFileName || !fromRankName) {
      const pos = findPiece(board, symbol, fromFileName || toFileName, fromRankName);
      if (!pos) {
        throw Error("Can't find piece");
      }
      fromFileName = pos.fileName;
      fromRankName = pos.rankName;
    }

    const fromFileNumber = fileNameToNumber(fromFileName);
    const fromRankNumber = rankNameToNumber(fromRankName);
    const toFileNumber = fileNameToNumber(toFileName);
    const toRankNumber = rankNameToNumber(toRankName);

    board[fromRankNumber][fromFileNumber] = '';
    board[toRankNumber][toFileNumber] = symbol;

    // console.log(`${symbol}: ${fromFileName}${fromRankName} -> ${toFileName}${toRankName}`);
  }
}

/**
 *
 * @param {string[][]} board
 * @param {string} symbol
 * @param {string} rankName
 * @param {string} fileName
 */
function findPiece (board, symbol, fileName="", rankName="") {
  const out = {
    rankName,
    fileName,
  };

  if (!fileName && rankName) {
    out.fileName = fileNumberToName(board[rankNameToNumber(fileName)].indexOf(symbol));
  } else if (fileName) {
    const fileNumber = fileNameToNumber(fileName);

    for (let rankNumber = 0; rankNumber < 8; rankNumber++) {
      if (board[rankNumber][fileNumber] === symbol) {
        out.rankName = rankNumberToName(rankNumber);
        break;
      }
    }
  } else {
    for (let rankNumber = 0; rankNumber < 8; rankNumber++) {
      const fileNumber = board[rankNumber].indexOf(symbol);
      if (fileNumber >= 0) {
        out.fileName = fileNumberToName(fileNumber);
        out.rankName = rankNumberToName(rankNumber);
        break;
      }
    }
  }

  if (!out.fileName || !out.rankName) {
    return null;
  }

  return out;
}