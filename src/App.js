import React from 'react';
import './App.css';
import { makeBoard, fileNumberToName, movePiece } from './chess';

const MOVE_HISTORY = "chess_move_history";

const MOVE_REGEX = /\d+\. *([^\s]+)(?: +([^\s]+))?/g;

/** @typedef {import('./chess').Position} Position */

export default class App extends React.Component {
  constructor (props) {
    super(props);

    const moves = localStorage.getItem(MOVE_HISTORY) || "";

    this.state = {
      moves,
      moveNumber: 0,
    };
  }

  updateMoves (moves) {
    const oldCount = countMoves(this.state.moves);
    let { moveNumber } = this.state;

    // If we were at the last move update to keep up with the end
    if (oldCount === moveNumber) {
      moveNumber = countMoves(moves);
    }

    this.setState({ moves, moveNumber })
  }

  componentDidUpdate (prevProps, prevState) {
    localStorage.setItem(MOVE_HISTORY, this.state.moves);

    if (this.state.moves !== prevState.moves) {
      this.setState({ moveNumber: countMoves(this.state.moves) });
    }
  }

  render () {
    const { moves, moveNumber } = this.state;

    const moveCount = countMoves(moves);

    const board = makeBoard();

    let move;
    let error;
    let i = 0;

    try {
      MOVE_REGEX.lastIndex = 0;
      while (move = MOVE_REGEX.exec(moves)) {
        const [ _, whiteMove, blackMove] = move;

        if (++i > this.state.moveNumber) {
          break;
        }

        movePiece(board, whiteMove, false);

        if (blackMove) {
          movePiece(board, blackMove, true);
        }
      }
    } catch (e) {
      e.message = `Move ${i} - ${e.message}`;
      error = e;
    }

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
        <div className="App-moves">
          <div>
            <button onClick={() => this.setState({ moveNumber: 0 })} disabled={moveNumber <= 0}>First</button>
            <button onClick={() => this.setState({ moveNumber: moveNumber - 1 })} disabled={moveNumber <= 0}>Prev</button>
            <button onClick={() => this.setState({ moveNumber: moveNumber + 1 })} disabled={moveNumber >= moveCount}>Next</button>
            <button onClick={() => this.setState({ moveNumber: moveCount })} disabled={moveNumber >= moveCount}>Last</button>
            Move number: {moveNumber}
          </div>
          <textarea value={moves} onChange={e=>this.updateMoves(e.target.value)} />
        </div>
        { error && <div className="App-error">{ error.message }</div> }
      </div>
    );
  }
}

function countMoves(moves) {
  MOVE_REGEX.lastIndex = 0;
  return matchAll(MOVE_REGEX, moves).length;
}

function matchAll (regex, subject) {
  const out = [];
  let match;
  while (match = regex.exec(subject)) {
    out.push(match);
  }
  return out;
}