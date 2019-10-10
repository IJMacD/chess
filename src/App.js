import React from 'react';
import './App.css';
import { makeBoard, fileNumberToName, movePiece } from './chess';

const MOVE_HISTORY = "chess_move_history";

const MOVE_REGEX = /\d+\. *([^ ]+)(?: +([^ ]+))?/g;

/** @typedef {import('./chess').Position} Position */

export default class App extends React.Component {
  constructor (props) {
    super(props);

    const moves = localStorage.getItem(MOVE_HISTORY) || "";

    this.state = {
      board: makeBoard(),
      moves,
      error: null,
      moveNumber: 0,
    };

    setTimeout(() => this.doMoves(moves), 10);
  }

  doMoves (moves) {
    MOVE_REGEX.lastIndex = 0;
    const board = makeBoard();

    let move;
    let i = 0;

    try {
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
    } catch (error) {
      error.message = `Move ${i} - ${error.message}`;
      this.setState({ error });
    }

    this.setState({ board });
  }

  componentDidUpdate (prevProps, prevState) {
    localStorage.setItem(MOVE_HISTORY, this.state.moves);

    if (this.state.moves !== prevState.moves) {
      this.setState({ moveNumber: countMoves(this.state.moves) });
    }

    if (this.state.moveNumber !== prevState.moveNumber) {
      this.doMoves(this.state.moves);
    }
  }

  render () {
    const { moves, moveNumber } = this.state;

    const moveCount = countMoves(moves);

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
        <div className="App-moves">
          <div>
            <button onClick={() => this.setState({ moveNumber: 0 })} disabled={moveNumber <= 0}>First</button>
            <button onClick={() => this.setState({ moveNumber: moveNumber - 1 })} disabled={moveNumber <= 0}>Prev</button>
            <button onClick={() => this.setState({ moveNumber: moveNumber + 1 })} disabled={moveNumber >= moveCount}>Next</button>
            <button onClick={() => this.setState({ moveNumber: moveCount })} disabled={moveNumber >= moveCount}>Last</button>
            Move number: {moveNumber}
          </div>
          <textarea value={moves} onChange={e=>this.setState({ moves: e.target.value, error: null })} />
        </div>
        { this.state.error && <div className="App-error">{ this.state.error.message }</div> }
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