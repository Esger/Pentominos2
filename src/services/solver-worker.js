onmessage = function (e) {
    console.log('Message received from main script');
    let offboards = e.data;
    let pentomino = e.data[0];
    pentomino.position.x -= 3;
    pentomino.face = 1;
    console.log('Posting message back to main script');
    postMessage(offboards);
};
