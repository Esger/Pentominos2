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
const xPentomino = () => getPentomino('x');
let startPosXBlock = 0;
let positionsTried = 0;
let proceed = true;

const adjustDimensions = function (pentomino) {
    if (!pentomino) return;
    if (pentomino.initialDimensions) {
        pentomino.dimensions = pentomino.initialDimensions.slice();
    }
    if (pentomino.face % 2 === 1) {
        pentomino.dimensions.reverse();
    }
};

const autoSolve = function () {
    if (allOffBoard()) {
        // put the x on board
        setOnboard(xPentomino());
        let xPosition = getXBlockPosition();
        while (xPosition) {  //for all x positions
            movePentomino(xPentomino(), 0, xPosition, false);
            sendFeedBack('draw');
            positionsTried++;
            findNextFit(offBoardPentominos.slice());
            xPosition = getXBlockPosition();
        }
    } else {
        findNextFit(offBoardPentominos.slice());
    }
};

const allOffBoard = function () {
    const emptyBoard = pentominos.length === 0;
    return emptyBoard;
};

const copyBoardFields = function () {
    const flds = [];
    for (let y = 0; y < boardHeight; y++) {
        flds.push([]);
        for (let x = 0; x < boardWidth; x++) {
            flds[y].push(fields[y][x]);
        }
    }
    return flds;
};

const discard = function (misFits) {
    const pentomino = pentominos.pop();
    pentomino.onBoard = false;
    misFits.push(pentomino);
    registerPiece(pentomino, -1);
};

const findFirstEmptyPosition = function () {
    // #todo Traverse arrays without for loop
    const firstAxis = Math.max(boardHeight, boardWidth);
    const secondAxis = Math.min(boardHeight, boardWidth);

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

const findFirstPartRight = function (pentomino) {
    let offsetRight = pentomino.dimensions[0];
    const face = pentomino.faces[pentomino.face];
    for (let j = 0; j < face.length; j++) {
        let part = face[j];
        offsetRight = ((part[1] === 0) && (part[0] < offsetRight)) ? part[0] : offsetRight;
    }
    return offsetRight;
};

const findFirstPartDown = function (pentomino) {
    let offsetDown = pentomino.dimensions[1];
    const face = pentomino.faces[pentomino.face];
    for (let j = 0; j < face.length; j++) {
        let part = face[j];
        offsetDown = ((part[0] === 0) && (part[1] < offsetDown)) ? part[1] : offsetDown;
    }
    return offsetDown;
};

const findNextFit = function (offBoards) {
    const misFits = [];
    const firstEmptyPosition = findFirstEmptyPosition();
    if (firstEmptyPosition) { // start trying other pentominos
        if (holeFitsXPieces(firstEmptyPosition)) {
            while (offBoards.length) {
                const pentomino = nextOnboard(offBoards);
                if (pentomino) {
                    const count = pentomino.faces.length;
                    for (let face = 0; face < count; face++) {
                        positionsTried++;
                        movePentomino(pentomino, face, firstEmptyPosition, true);
                        if (isFitting() && proceed) {
                            // sendFeedBack('draw');
                            findNextFit(sortPentominos(misFits.concat(offBoards)));
                        }
                    }
                    discard(misFits);
                    // sendFeedBack('draw');
                } // else next pentomino
            }
        }
    } else {
        sendFeedBack('solution');
    }
};

const findPentominoByName = function (set, name) {
    return set.find((pento) => { return pento.name === name; });
};

const getPentomino = function (name) {
    const pentomino = findPentominoByName(pentominos.concat(offBoardPentominos), name);
    return pentomino;
};

const getXBlockPosition = function () {
    if (startPosXBlock < startPositionsXblock[boardType].length) {
        const position = startPositionsXblock[boardType][startPosXBlock].slice();
        startPosXBlock += 1;
        return position;
    } else {
        return false;
    }
};

// find out if open region at x,y is large enough for a pentomino by recursion counting
// xy has to be the most upper left open spot
const holeFitsXPieces = function (xy) {
    let holeSize = 0;
    const label = 'a';
    const board = copyBoardFields();

    const countDown = (xy) => {
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

    const countUp = (xy) => {
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

    const countRight = (xy) => {
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

    const countLeft = (xy) => {
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

const boardHas60Squares = function () {
    return !(boardType === 'square' || boardType === 'stick');
};

const holeFits = function (sum) {
    const compensation = (oPentominoOnboard() || boardHas60Squares()) ? 0 : 4;
    return ((sum - compensation) % 5 === 0);
};

const initVariables = function (data) {
    boardType = data.boardType;
    boardWidth = data.boardWidth;
    boardHeight = data.boardHeight;
    rotatedBoard = boardHeight < boardWidth;
    fields = data.fields;
    pentominos = data.onBoards;
    offBoardPentominos = data.offBoards;
};

// Return true if no overlapping pieces and all pieces are completely on the board
const isFitting = function () {
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

const logBoard = function () {
    const flds = setBoardFields('');
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

const movePentomino = function (pentomino, face, position, shiftIt) {
    let newPosition;
    registerPiece(pentomino, -1);
    setFace(pentomino, face);
    // If left top of pentomino is empty ___|
    // move pentomino to the left or up in case of oblong board 
    if (rotatedBoard) {
        if (shiftIt && position[1] > 0) {
            const yShift = findFirstPartDown(pentomino);
            newPosition = [position[0], position[1] - yShift];
        } else {
            newPosition = position;
        }
    } else {
        if (shiftIt && position[0] > 0) {
            const xShift = findFirstPartRight(pentomino);
            newPosition = [position[0] - xShift, position[1]];
        } else {
            newPosition = position;
        }
    }
    setPosition(pentomino, newPosition);
    registerPiece(pentomino, 1);
};

const nextOnboard = function (offBoards) {
    let pentomino = offBoards.shift();
    pentomino.onBoard = true;
    pentominos.push(pentomino);
    registerPiece(pentomino, 1);
    return pentomino;
};

const noneStickingOut = function (sum) {
    const compensation = oPentominoOnboard() ? 4 : 0;
    return ((sum - compensation) % 5 === 0);
};

const onBoard = function (x, y) {
    return (x >= 0) && (x < boardWidth) && (y >= 0) && (y < boardHeight);
};

const oPentominoOnboard = function () {
    return pentominos.some(pentomino => pentomino.name === 'o');
};

const registerPiece = function (pentomino, onOff) {
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

const sendFeedBack = function (message) {
    // logBoard();
    const workerData = {
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
            break;
        default:
            close();
            break;
    }
    postMessage(workerData);
};

const setFace = function (pentomino, face) {
    pentomino.face = face;
    adjustDimensions(pentomino);
};

const setPosition = function (pentomino, position) {
    pentomino.position.x = position[0];
    pentomino.position.y = position[1];
};

const setBoardFields = function (content) {
    const w = boardWidth;
    const h = boardHeight;
    const fields = [];
    for (let y = 0; y < h; y++) {
        fields.push([]);
        for (let x = 0; x < w; x++) {
            fields[y].push(content);
        }
    }
    return fields;
};

const setOnboard = function (pentomino) {
    pentominos.push(pentomino);
    const index = offBoardPentominos.indexOf(pentomino);
    offBoardPentominos.splice(index, 1);
};

const sortPentominos = function (pentos) {
    pentos.sort((a, b) => a.index - b.index);
    return pentos;
};

onmessage = function (e) {
    positionsTried = 0;
    let message = e.data.message;
    switch (message) {
        case 'solve':
            proceed = true;
            initVariables(e.data);
            autoSolve();
            break;
        case 'stop':
            proceed = false;
            break;
        default:
            break;
    }
    sendFeedBack('finish');
};
