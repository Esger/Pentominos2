autoSolve = function (offBoards, onBoards) {
    let pentomino = offBoards[0];
    pentomino.position.x -= 3;
    pentomino.face = 1;
    let workerData = {
        offBoards: offBoards,
        onBoards: onBoards
    };
    postMessage(workerData);
};

onmessage = function (e) {
    console.log('Starting solver worker');
    let offBoards = e.data.offBoards;
    let onBoards = e.data.onBoards;
    autoSolve(offBoards, onBoards);
    console.log('Solver worker finished');
};
