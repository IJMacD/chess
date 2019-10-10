/**
 * @typedef Position
 * @prop {string} fileName
 * @prop {string} rankName
 * @prop {number} fileNumber
 * @prop {number} rankNumber
 */

export function makeBoard() {
    return [
        ['♜', '♞', '♝', '♚', '♛', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♔', '♕', '♗', '♘', '♖']
    ];
}


/** @param {number} fileNumber */
export function fileNumberToName (fileNumber) {
    return String.fromCharCode(0x61 + fileNumber);
}

/** @param {string} fileName */
export function fileNameToNumber (fileName) {
    return fileName.charCodeAt(0) - 0x61;
}

/** @param {number} rankNumber */
export function rankNumberToName (rankNumber) {
    return String(8 - rankNumber);
}

/** @param {string} rankName */
export function rankNameToNumber (rankName) {
    return 8 - +rankName;
}

/**
 * @param {string} pieceName
 */
export function pieceNameToSymbol (pieceName, black=false) {
    switch (pieceName) {
    case "K": return black ? "♛" : "♕";
    case "Q": return black ? "♚" : "♔";
    case "B": return black ? "♝" : "♗";
    case "N": return black ? "♞" : "♘";
    case "R": return black ? "♜" : "♖";
    default: return black ? "♟" : "♙";
    }
}

/**
 * @param {string} symbol
 */
export function pieceSymbolToName (symbol) {
    switch (symbol) {
    case "♛":
    case "♕":
        return "K";
    case "♚":
    case "♔":
        return "Q";
    case "♝":
    case "♗":
        return "B";
    case "♞":
    case "♘":
    return "N";
    case "♜":
    case "♖":
        return "R";
    case "♟":
    case "♙":
        return "";
    }
    return false;
}

/**
 * @param {string} symbol
 */
export function symbolToColour (symbol) {
    if (['♜','♞','♝','♚','♛','♟'].includes(symbol)) return "black";
    if (['♖','♘','♗','♔','♕','♙'].includes(symbol)) return "white";
}

/**
 * @param {string} fileName
 * @param {string} rankName
 * @returns {Position}
 */
export function positionFromNames (fileName, rankName) {
    return {
        fileName,
        rankName,
        fileNumber: fileNameToNumber(fileName),
        rankNumber: rankNameToNumber(rankName),
    };
}

/**
 * @param {number} fileNumber
 * @param {number} rankNumber
 * @returns {Position}
 */
export function positionFromNumbers (fileNumber, rankNumber) {
    return {
        fileNumber,
        rankNumber,
        fileName: fileNumberToName(fileNumber),
        rankName: rankNumberToName(rankNumber),
    };
}

const reMove = /([KQBNR]?)([a-h]?)([1-8]?)x?([a-h])([1-8])(?:=([QBNR]))?/;
export function movePiece (board, move, isBlack=false) {

    if (move === "O-O") {
        if (isBlack) {
            if (board[0][4] === '♛' &&
                board[0][5] === '' &&
                board[0][6] === '' &&
                board[0][7] === '♜'
            ) {
                board[0][4] = '';
                board[0][5] = '♜';
                board[0][6] = '♛';
                board[0][7] = '';
            } else {
                throw Error("Illegal Castling")
            }
        }
        else {
            if (board[7][4] === '♕' &&
                board[7][5] === '' &&
                board[7][6] === '' &&
                board[7][7] === '♖'
            ) {
                board[7][4] = '';
                board[7][5] = '♖';
                board[7][6] = '♕';
                board[7][7] = '';
            } else {
                throw Error("Illegal Castling")
            }
        }

        return;
    }

    if (move === "O-O-O") {
        if (isBlack) {
            if (
                board[0][0] === '♜' &&
                board[0][1] === '' &&
                board[0][2] === '' &&
                board[0][3] === '' &&
                board[0][4] === '♛'
            ) {
                board[0][0] = '';
                board[0][2] = '♛';
                board[0][3] = '♜';
                board[0][4] = '';
            } else {
                throw Error("Illegal Castling")
            }
        }
        else {
            if (
                board[7][0] === '♖' &&
                board[7][1] === '' &&
                board[7][2] === '' &&
                board[7][3] === '' &&
                board[7][4] === '♕'
            ) {
                board[7][0] = '';
                board[7][2] = '♕';
                board[7][3] = '♖';
                board[7][4] = '';
            } else {
                throw Error("Illegal Castling")
            }
        }

        return;
    }

    if (reMove.test(move)) {
        let [_, piece, fromFileName, fromRankName, toFileName, toRankName, promotion] = reMove.exec(move);

        let symbol = pieceNameToSymbol(piece, isBlack);

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

        if (promotion) {
            if (isBlack && piece === "" && toPos.rankName === "1") {
                symbol = pieceNameToSymbol(promotion, true);
            } else if (!isBlack && piece === "" && toPos.rankName === "8") {
                symbol = pieceNameToSymbol(promotion, false);
            } else {
                throw Error("Illegal promotion");
            }
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
    const deltaRank = to.rankNumber - from.rankNumber;
    const deltaFile = to.fileNumber - from.fileNumber;

    const absDeltaRank = Math.abs(deltaRank);
    const absDeltaFile = Math.abs(deltaFile);

    const rankStep = Math.sign(deltaRank);
    const fileStep = Math.sign(deltaFile);

    for (let i = 1; i < Math.max(absDeltaFile, absDeltaRank); i++) {
        const f = from.fileNumber + i * fileStep;
        const r = from.rankNumber + i * rankStep;

        if (board[r][f] !== '') return false;
    }

    return true;
}