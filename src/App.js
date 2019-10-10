import React from 'react';
import './App.css';
import { makeBoard, fileNumberToName, pieceNameToSymbol, rankNameToNumber, fileNameToNumber, rankNumberToName, symbolToColour, pieceSymbolToName, positionFromNames, positionFromNumbers } from './chess';

const MOVE_HISTORY = "chess_move_history";

/** @typedef {import('./chess').Position} Position */

export default class App extends React.Component {
  constructor (props) {
    super(props);

    const moves = localStorage.getItem(MOVE_HISTORY) || "";

    this.state = {
      board: this.doMoves(moves),
      moves,
      error: null,
    };
  }

  doMoves (moves) {
    const re = /^\d+\. *([^ ]+)(?: +([^ ]+))?/
    const moveList = moves.split("\n").filter(m => re.test(m));

    const board = makeBoard();

    try {
      for (const move of moveList) {
        const [ _, whiteMove, blackMove] = re.exec(move);

        movePiece(board, whiteMove, false);

        if (blackMove) {
          movePiece(board, blackMove, true);
        }
      }
    } catch (error) {
      this.setState({ error });
    }

    return board;
  }

  componentDidUpdate (prevProps, prevState) {
    localStorage.setItem(MOVE_HISTORY, this.state.moves);
    if (this.state.moves !== prevState.moves) {
      const board = this.doMoves(this.state.moves);
      this.setState({ board });
    }
  }

  render () {
    return (
      <div className="App">
        <table className="App-Board">
          <tbody>
          {
            this.state.board.map((rank,rankNumber) => (
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
        <textarea className="App-moves" value={this.state.moves} onChange={e=>this.setState({ moves: e.target.value, error: null })} />
        { this.state.error && <div className="App-error">{ this.state.error.message }</div> }
      </div>
    );
  }
}



const reMove = /([KQBNR]?)([a-h]?)([1-8]?)([a-h])([1-8])/;
function movePiece (board, move, isBlack=false) {
  if (reMove.test(move)) {
    let [_, piece, fromFileName, fromRankName, toFileName, toRankName] = reMove.exec(move);

    const symbol = pieceNameToSymbol(piece, isBlack);

    let fromPos;
    const toPos = positionFromNames(toFileName, toRankName);

    if (fromFileName && fromRankName) {
      fromPos = positionFromNames(fromFileName, fromRankName);

      if (!isValidMove(board, fromPos, toPos)) {
        throw Error(`Invalid Move: ${symbol}: ${fromFileName}${fromRankName} -> ${toFileName}${toRankName}`);
      }
    } else {
      fromPos = findPieces(board, symbol, fromFileName, fromRankName).find(p => isValidMove(board, p, toPos));

      if (!fromPos) {
        throw Error(`Invalid Move: ${symbol}: -> ${toFileName}${toRankName}`);
      }

      fromFileName = fromPos.fileName;
      fromRankName = fromPos.rankName;
    }

    board[fromPos.rankNumber][fromPos.fileNumber] = '';
    board[toPos.rankNumber][toPos.fileNumber] = symbol;
  }
}

/**
 *
 * @param {string[][]} board
 * @param {string} symbol
 * @returns {Position[]}
 */
function findPieces (board, symbol, fileName="", rankName="") {
  const out = [];

  if (fileName && rankName) {
    const pos = positionFromNames(fileName, rankName);

    if (board[pos.rankNumber][pos.fileNumber]) {
      out.push(pos);
    }
  } else if (fileName) {
    const fileNumber = fileNameToNumber(fileName);

    for (let rankNumber = 0; rankNumber < 8; rankNumber++) {
      if (board[rankNumber][fileNumber] === symbol) {
        out.push(positionFromNumbers(fileNumber, rankNumber));
      }
    }
  } else if (rankName) {
    const rankNumber = rankNameToNumber(rankName);

    for (let fileNumber = 0; fileNumber < 8; fileNumber++) {
      if (board[rankNumber][fileNumber] === symbol) {
        out.push(positionFromNumbers(fileNumber, rankNumber));
      }
    }
  }
  else {
    for (let rankNumber = 0; rankNumber < 8; rankNumber++) {
      for (let fileNumber = 0; fileNumber < 8; fileNumber++) {
        if (board[rankNumber][fileNumber] === symbol) {
          out.push(positionFromNumbers(fileNumber, rankNumber));
        }
      }
    }
  }

  return out;
}

/**
 *
 * @param {string[][]} board
 * @param {Position} from
 * @param {Position} to
 */
function isValidMove (board, from, to) {
  const fromPieceSymbol = board[from.rankNumber][from.fileNumber];
  const toPieceSymbol = board[to.rankNumber][to.fileNumber];

  if (!fromPieceSymbol) return false;

  const fromColour = symbolToColour(fromPieceSymbol);
  const toColour = symbolToColour(toPieceSymbol);

  if (fromColour === toColour) return false;

  const fromPieceName = pieceSymbolToName(fromPieceSymbol);

  const deltaRank = to.rankNumber - from.rankNumber;
  const deltaFile = to.fileNumber - from.fileNumber;
  const absDeltaRank = Math.abs(deltaRank);
  const absDeltaFile = Math.abs(deltaFile);

  switch (fromPieceName) {
    //pawn
    case "": {
      // When taking file must be different
      if (toPieceSymbol) {
        return absDeltaFile === 1 && absDeltaRank === 1;
      }

      // Unless taking a piece pawns must remain in the same file
      if (from.fileName !== to.fileName) return false;

      if (fromColour === "white") {
        if (from.rankName === "2" && deltaRank === -2) return true;
        return deltaRank === -1 && Math.abs(deltaFile) <= 1;
      } else if (fromColour === "black") {
        if (from.rankName === "7" && deltaRank === 2) return true;
        return deltaRank === 1 && Math.abs(deltaFile) <= 1;
      }

      break;
    }
    // Queen
    case "Q": {
      return isPathClear(board, from, to) && (deltaRank === 0 || deltaFile === 0 || absDeltaRank === absDeltaFile);
    }
    // Knight
    case "N": {
      return (absDeltaFile === 2 && absDeltaRank === 1) || (absDeltaFile === 1 && absDeltaRank === 2);
    }
    // Rook
    case "R": {
      return isPathClear(board, from, to) && (deltaRank === 0 || deltaFile === 0);
    }
    // King
    case "K": {
      return absDeltaRank <= 1 && absDeltaFile <= 1;
    }
    // Bishop
    case "B": {
      return isPathClear(board, from, to) && absDeltaRank === absDeltaFile;
    }
  }
}

function isPathClear (board, from, to) {
  return true;
}