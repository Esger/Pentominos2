var boardType = '';
var boardWidth, boardHeight;
var fields = [];
var pentominos = [];
var offBoardPentominos = [];
var startPositionsXblock = {
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
    ],
    'beam': [
    ],
    'stick': [
    ],
    'twig': [
        [1, 0],
        [6, 0]
    ],
};
var xPentomino = () => getPentomino('x');
var startPosXBlock = 0;
var positionsTried = 0;

var adjustDimensions = function (pentomino) {
    if (pentomino && pentomino.initialDimensions) {
        pentomino.dimensions = pentomino.initialDimensions.slice();
    }
    if (pentomino && pentomino.face % 2 == 1) {
        pentomino.dimensions.reverse();
    }
};

var autoSolve = function (offBoards, onBoards) {
    if (allOffBoard()) {
        // put the x on board
        setOnboard(xPentomino(), false);
        let xPosition = getXBlockPosition();
        while (xPosition) {  //for all x positions
            movePentomino(xPentomino(), 0, xPosition, false);
            offBoards = findNextFit(offBoards);
            xPosition = getXBlockPosition();
        }
    } else {
        offBoards = findNextFit(offBoards);
    }
};

var allOffBoard = function (pentos) {
    let emptyBoard = pentos == 0;
    return emptyBoard;
};

var copyBoardFields = function () {
    let flds = [];
    for (let y = 0; y < boardHeight; y++) {
        flds.push([]);
        for (let x = 0; x < boardWidth; x++) {
            flds[y].push(fields[y][x]);
        }
    }
    return flds;
};

var discard = function (misFits) {
    let pentomino = pentominos.pop();
    pentomino.onBoard = false;
    misFits.push(pentomino);
    registerPiece(pentomino, -1);
};

var findFirstEmptyPosition = function () {
    // #todo Traverse arrays without for loop
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (fields[y][x] === 0) return [x, y];
        }
    }
    return false;
};

var findFirstPartRight = function (pentomino) {
    let offsetRight = pentomino.dimensions[0];
    let part = pentomino.faces[pentomino.face][0];
    for (let j = 0; j < pentomino.faces[pentomino.face].length; j++) {
        part = pentomino.faces[pentomino.face][j];
        offsetRight = ((part[1] === 0) && (part[0] < offsetRight)) ? part[0] : offsetRight;
    }
    return offsetRight;
};

var findNextFit = function (offBoards) {
    let misFits = [];
    const firstEmptyPosition = findFirstEmptyPosition();
    if (firstEmptyPosition) { // start trying other pentominos
        if (holeFitsXPieces(firstEmptyPosition)/* && this.positionsTried < 10000 */) {
            while (offBoards.length) {
                const pentomino = nextOnboard(offBoards);
                if (pentomino) {
                    console.clear();
                    console.log('trying ', positionsTried, pentomino.name);
                    const count = pentomino.faces.length;
                    for (let face = 0; face < count; face++) {
                        positionsTried++;
                        movePentomino(pentomino, face, firstEmptyPosition, true);
                        if (isFitting()) {
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
    return misFits;
};

var findPentominoByName = function (set, name) {
    return set.find((pento) => { return pento.name === name; });
};

var getPentomino = function (name) {
    let pentomino = findPentominoByName(pentominos.concat(offBoardPentominos), name);
    return pentomino;
};

var getXBlockPosition = function () {
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
var holeFitsXPieces = function (xy) {
    var holeSize = 0;
    var oPentoOnboard = oPentominoOnboard();
    var label = 'a';
    var board = copyBoardFields();
    var y = xy[1];

    var countDown = (xy) => {
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

    var countUp = (xy) => {
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

    var countRight = (xy) => {
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

    var countLeft = (xy) => {
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

var holeFits = function (sum) {
    let compensation = (oPentominoOnboard() || boardType === 'rectangle') ? 0 : 4;
    return ((sum - compensation) % 5 === 0);
};

var initVariables = function (data) {
    boardType = data.boardType;
    boardWidth = data.boardWidth;
    boardHeight = data.boardHeight;
    fields = data.fields;
    pentominos = data.onBoards;
    offBoardPentominos = data.offBoards;
};

// Return true if no overlapping pieces and all pieces are completely on the board
var isFitting = function () {
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

var logBoard = function () {
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

var movePentomino = function (pentomino, face, position, shiftLeft) {
    let newPosition;
    registerPiece(pentomino, -1);
    setFace(pentomino, face);
    // If left top of pentomino is empty ___|
    // move pentomino to the left
    if (shiftLeft && position[0] > 0) {
        let xShift = findFirstPartRight(pentomino);
        newPosition = [position[0] - xShift, position[1]];
    } else {
        newPosition = position;
    }
    setPosition(pentomino, newPosition);
    registerPiece(pentomino, 1);
};

var nextOnboard = function (offBoards) {
    let pentomino = offBoards.shift();
    pentomino.onBoard = true;
    pentominos.push(pentomino);
    registerPiece(pentomino, 1);
    return pentomino;
};

var noneStickingOut = function (sum) {
    let compensation = (oPentominoOnboard() || boardType === 'rectangle') ? 4 : 0;
    return ((sum - compensation) % 5 === 0);
};

var onBoard = function (x, y) {
    return (x >= 0) && (x < boardWidth) && (y >= 0) && (y < boardHeight);
};

var oPentominoOnboard = function () {
    return pentominos.filter((pento) => {
        return pento.name === 'o';
    }).length > 0;
};

var registerPiece = function (pentomino, onOff) {
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

var sendFeedBack = function (message) {
    // logBoard();
    let workerData = {
        message: message || 'no message given',
        offBoards: offBoardPentominos || [],
        onBoards: pentominos || []
    };
    postMessage(workerData);
};

var setFace = function (pentomino, face) {
    pentomino.face = face;
    adjustDimensions(pentomino);
};

var setPosition = function (pentomino, position) {
    pentomino.position.x = position[0];
    pentomino.position.y = position[1];
};

var setBoardFields = function (content) {
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

var setOnboard = function (pentomino) {
    pentominos.push(pentomino);
    let index = offBoardPentominos.indexOf(pentomino);
    offBoardPentominos.splice(index, 1);
};

var sortPentominos = function (pentos) {
    pentos.sort((a, b) => {
        return a.index - b.index;
    });
    return pentos;
};

onmessage = function (e) {
    console.log('Starting solver worker');
    initVariables(e.data);
    autoSolve(offBoardPentominos, pentominos);
    console.log('Solver worker finished');
};