
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