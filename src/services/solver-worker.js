let boardType = '';
let boardWidth;
let boardHeight;
let rotatedBoard = false;
let fields = [];
let pentominos = [];
let offBoardPentominos = [];
let startPositionsXblock = {
    'square': [
        [1, 0],
        [1, 1],
        [2, 0],
        [2, 1],
        [2, 2]
    ],
    'rectangle': [
        [1, 0],
        [0, 1],
        [1, 1],
        [0, 2],
        [1, 2],
        [0, 3],
        [1, 3]
    ],
    'dozen': [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1]
    ],
    'beam': [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0]
    ],
    'stick': [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0]
    ],
    'twig': [
        [1, 0],
        [6, 0]
    ]
};
let xPentomino = () => getPentomino('x');
let startPosXBlock = 0;
let positionsTried = 0;
let proceed = true;

let adjustDimensions = function (pentomino) {
    if (pentomino && pentomino.initialDimensions) {
        pentomino.dimensions = pentomino.initialDimensions.slice();
    }
    if (pentomino && pentomino.face % 2 === 1) {
        pentomino.dimensions.reverse();
    }
};

let autoSolve = function (offBoards) {
    if (allOffBoard()) {
        // put the x on board
        setOnboard(xPentomino(), false);
        let xPosition = getXBlockPosition();
        while (xPosition) {  //for all x positions
            movePentomino(xPentomino(), 0, xPosition, false);
            sendFeedBack('draw');
            positionsTried++;
            offBoards = findNextFit(offBoards);
            xPosition = getXBlockPosition();
        }
    } else {
        offBoards = findNextFit(offBoards);
    }
    return offBoards;
};

let allOffBoard = function () {
    let emptyBoard = pentominos.length === 0;
    return emptyBoard;
};

let copyBoardFields = function () {
    let flds = [];
    for (let y = 0; y < boardHeight; y++) {
        flds.push([]);
        for (let x = 0; x < boardWidth; x++) {
            flds[y].push(fields[y][x]);
        }
    }
    return flds;
};

let discard = function (misFits) {
    let pentomino = pentominos.pop();
    pentomino.onBoard = false;
    misFits.push(pentomino);
    registerPiece(pentomino, -1);
};

let findFirstEmptyPosition = function () {
    // #todo Traverse arrays without for loop
    let firstAxis = Math.max(boardHeight, boardWidth);
    let secondAxis = Math.min(boardHeight, boardWidth);

    for (let i = 0; i < firstAxis; i++) {
        for (let j = 0; j < secondAxis; j++) {
            if (rotatedBoard) {
                if (fields[j][i] === 0) return [i, j];
            } else {
                if (fields[i][j] === 0) return [j, i];
            }
        }
    }
    return false;
};

let findFirstPartRight = function (pentomino) {
    let offsetRight = pentomino.dimensions[0];
    let face = pentomino.faces[pentomino.face];
    for (let j = 0; j < face.length; j++) {
        let part = face[j];
        offsetRight = ((part[1] === 0) && (part[0] < offsetRight)) ? part[0] : offsetRight;
    }
    return offsetRight;
};

let findFirstPartDown = function (pentomino) {
    let offsetDown = pentomino.dimensions[1];
    let face = pentomino.faces[pentomino.face];
    for (let j = 0; j < face.length; j++) {
        let part = face[j];
        offsetDown = ((part[0] === 0) && (part[1] < offsetDown)) ? part[1] : offsetDown;
    }
    return offsetDown;
};

let findNextFit = function (offBoards) {
    let misFits = [];
    const firstEmptyPosition = findFirstEmptyPosition();
    if (firstEmptyPosition) { // start trying other pentominos
        if (holeFitsXPieces(firstEmptyPosition)) {
            while (offBoards.length) {
                const pentomino = nextOnboard(offBoards);
                if (pentomino) {
                    // console.clear();
                    // console.log('trying ', positionsTried, pentomino.name);
                    const count = pentomino.faces.length;
                    for (let face = 0; face < count; face++) {
                        positionsTried++;
                        movePentomino(pentomino, face, firstEmptyPosition, true);
                        if (isFitting() && proceed) {
                            sendFeedBack('draw');
                            findNextFit(sortPentominos(misFits.concat(offBoards)));
                        }
                    }
                    discard(misFits);
                    sendFeedBack('draw');
                } // else next pentomino
            }
        }
    } else {
        sendFeedBack('solution');
    }
    return misFits.concat(offBoards);
};

let findPentominoByName = function (set, name) {
    return set.find((pento) => { return pento.name === name; });
};

let getPentomino = function (name) {
    let pentomino = findPentominoByName(pentominos.concat(offBoardPentominos), name);
    return pentomino;
};

let getXBlockPosition = function () {
    if (startPosXBlock < startPositionsXblock[boardType].length) {
        let position = startPositionsXblock[boardType][startPosXBlock].slice();
        startPosXBlock += 1;
        return position;
    } else {
        return false;
    }
};

// find out if open region at x,y is large enough for a pentomino by recursion counting
// xy has to be the most up left open spot
let holeFitsXPieces = function (xy) {
    let holeSize = 0;
    let oPentoOnboard = oPentominoOnboard();
    let label = 'a';
    let board = copyBoardFields();
    let y = xy[1];

    let countDown = (xy) => {
        let y = xy[1];
        const x = xy[0];
        while ((y < boardHeight) && (board[y][x] === 0)) {
            board[y][x] = label;
            holeSize++;
            // console.table(board);
            countLeft([x - 1, y]);
            countRight([x + 1, y]);
            y++;
        }
    };

    let countUp = (xy) => {
        let y = xy[1];
        const x = xy[0];
        while ((y >= 0) && (board[y][x] === 0)) {
            board[y][x] = label;
            holeSize++;
            // console.table(board);
            countRight([x + 1, y]);
            countLeft([x - 1, y]);
            y--;
        }
    };

    let countRight = (xy) => {
        let x = xy[0];
        const y = xy[1];
        while ((x < boardWidth) && (board[y][x] === 0)) {
            board[y][x] = label;
            holeSize++;
            // console.table(board);
            countDown([x, y + 1]);
            countUp([x, y - 1]);
            x++;
        }
    };

    let countLeft = (xy) => {
        let x = xy[0];
        const y = xy[1];
        while ((x >= 0) && (board[y][x] === 0)) {
            board[y][x] = label;
            holeSize++;
            // console.table(board);
            countDown([x, y + 1]);
            countUp([x, y - 1]);
            x--;
        }
    };

    countRight(xy);
    return holeFits(holeSize);
};

let boardHas60Squares = function () {
    return !(boardType === 'square' || boardType === 'stick');
};

let holeFits = function (sum) {
    let compensation = (oPentominoOnboard() || boardHas60Squares()) ? 0 : 4;
    return ((sum - compensation) % 5 === 0);
};

let initVariables = function (data) {
    boardType = data.boardType;
    boardWidth = data.boardWidth;
    boardHeight = data.boardHeight;
    rotatedBoard = boardHeight < boardWidth;
    fields = data.fields;
    pentominos = data.onBoards;
    offBoardPentominos = data.offBoards;
};

// Return true if no overlapping pieces and all pieces are completely on the board
let isFitting = function () {
    let sum = 0;
    const h = fields.length;
    for (let y = 0; y < h; y++) {
        const w = fields[y].length;
        for (let x = 0; x < w; x++) {
            if (fields[y][x] > 1) {
                return false;
            } else {
                sum += fields[y][x];
            }
        }
    }
    return noneStickingOut(sum);
};

let logBoard = function () {
    let flds = setBoardFields('');
    const blockCount = pentominos.length;
    for (let i = 0; i < blockCount; i++) {
        const pentomino = pentominos[i];
        const face = pentomino.faces[pentomino.face];
        const partCount = face.length;
        for (let j = 0; j < partCount; j++) {
            const x = face[j][0] + pentomino.position.x;
            const y = face[j][1] + pentomino.position.y;
            if (y < boardHeight && x < boardWidth) {
                flds[y][x] += pentomino.name;
            }
        }
    }
    console.clear();
    console.table(flds);
};

let movePentomino = function (pentomino, face, position, shiftIt) {
    let newPosition;
    registerPiece(pentomino, -1);
    setFace(pentomino, face);
    // If left top of pentomino is empty ___|
    // move pentomino to the left or up in case of rotated board 
    if (rotatedBoard) {
        if (shiftIt && position[1] > 0) {
            let yShift = findFirstPartDown(pentomino);
            newPosition = [position[0], position[1] - yShift];
        } else {
            newPosition = position;
        }
    } else {
        if (shiftIt && position[0] > 0) {
            let xShift = findFirstPartRight(pentomino);
            newPosition = [position[0] - xShift, position[1]];
        } else {
            newPosition = position;
        }
    }
    setPosition(pentomino, newPosition);
    registerPiece(pentomino, 1);
};

let nextOnboard = function (offBoards) {
    let pentomino = offBoards.shift();
    pentomino.onBoard = true;
    pentominos.push(pentomino);
    registerPiece(pentomino, 1);
    return pentomino;
};

let noneStickingOut = function (sum) {
    let compensation = !(oPentominoOnboard() || boardHas60Squares()) ? 4 : 0;
    return ((sum - compensation) % 5 === 0);
};

let onBoard = function (x, y) {
    return (x >= 0) && (x < boardWidth) && (y >= 0) && (y < boardHeight);
};

let oPentominoOnboard = function () {
    return pentominos.filter((pento) => {
        return pento.name === 'o';
    }).length > 0;
};

let registerPiece = function (pentomino, onOff) {
    if (pentomino) {
        let onBoardParts = 0;
        const face = pentomino.faces[pentomino.face];
        const partsCount = face.length;
        for (let i = 0; i < partsCount; i++) {
            const part = face[i];
            const x = part[0] + pentomino.position.x;
            const y = part[1] + pentomino.position.y;
            if (onBoard(x, y)) {
                fields[y][x] += onOff;
                onBoardParts += 1;
            }
            pentomino.onBoard = (onBoardParts == partsCount);
        }
    }
};

let sendFeedBack = function (message) {
    // logBoard();
    let workerData = {
        message: message || 'solution',
        positions: positionsTried,
        onBoards: []
    };
    switch (message) {
        case 'draw':
            workerData.onBoards = pentominos;
            break;
        case 'solution':
            workerData.onBoards = pentominos;
            break;
        case 'finish':
            workerData.onBoards = pentominos.concat(offBoardPentominos);
            postMessage(workerData);
            close();
        default:
            close();
            break;
    }
    postMessage(workerData);
};

let setFace = function (pentomino, face) {
    pentomino.face = face;
    adjustDimensions(pentomino);
};

let setPosition = function (pentomino, position) {
    pentomino.position.x = position[0];
    pentomino.position.y = position[1];
};

let setBoardFields = function (content) {
    let w = boardWidth;
    let h = boardHeight;
    let fields = [];
    for (let y = 0; y < h; y++) {
        fields.push([]);
        for (let x = 0; x < w; x++) {
            fields[y].push(content);
        }
    }
    return fields;
};

let setOnboard = function (pentomino) {
    pentominos.push(pentomino);
    let index = offBoardPentominos.indexOf(pentomino);
    offBoardPentominos.splice(index, 1);
};

let sortPentominos = function (pentos) {
    pentos.sort((a, b) => {
        return a.index - b.index;
    });
    return pentos;
};

onmessage = function (e) {
    let message = e.data.message;
    switch (message) {
        case 'solve':
            proceed = true;
            initVariables(e.data);
            offBoardPentominos = autoSolve(offBoardPentominos, pentominos);
            break;
        case 'stop':
            proceed = false;
            break;
        default:
            break;
    }
    sendFeedBack('finish');
};
