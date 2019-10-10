import React from 'react';
import './App.css';
import { makeBoard, fileNumberToName, movePiece } from './chess';

const MOVE_HISTORY = "chess_move_history";

/** @typedef {import('./chess').Position} Position */

export default class App extends React.Component {
  constructor (props) {
    super(props);

    const moves = localStorage.getItem(MOVE_HISTORY) || "";

    this.state = {
      board: makeBoard(),
      moves,
      error: null,
    };

    setTimeout(() => this.doMoves(moves), 10);
  }

  doMoves (moves) {
    const re = /\d+\. *([^ ]+)(?: +([^ ]+))?/g
    const board = makeBoard();

    let move;
    let i = 1;

    try {
      while (move = re.exec(moves)) {
        const [ _, whiteMove, blackMove] = move;

        movePiece(board, whiteMove, false);

        if (blackMove) {
          movePiece(board, blackMove, true);
        }

        i++;
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
      this.doMoves(this.state.moves);
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
