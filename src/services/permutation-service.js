import { inject } from 'aurelia-framework';
import { BoardService } from './board-service';

@inject(BoardService)
export class PermutationService {

    constructor(boardService) {
        this.bs = boardService;

        this._rotable = [
            // the numbers represent the new face index for a given face index after permuting
            [ // 0 - first square -> rotate clockwise
                [1, 2, 3, 0, 5, 6, 7, 4], // blyfn
                [1, 2, 3, 0], // vw
                [1, 2, 3, 0], // tc
                [1, 0, 3, 2], // z
                [1, 0], // i
                [0] // xo not necessary
            ],
            [ // 1 - second square -> flip around yAxis
                [4, 7, 6, 5, 0, 3, 2, 1], // blyfn
                [3, 2, 1, 0], // vw
                [0, 3, 2, 1], // tc
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ],
            [ // 2 - third square -> flip around xAxis
                [6, 5, 4, 7, 2, 1, 0, 3], // blyfn
                [1, 0, 3, 2], // vw
                [2, 1, 0, 3], // tc
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ],
            [ // 3 - any other square -> rotate counter clockwise
                [3, 0, 1, 2, 7, 4, 5, 6], // blyfn
                [3, 0, 1, 2], // vw
                [3, 0, 1, 2], // tc
                [0, 1, 2, 3], // z
                [1, 0], // i
                [0] // xo not necessary
            ]
        ];
        this._permutationTypeLookup = [
            // the numbers represent the permutation type that must be applied for a given face index and block type
            [0, 1, 2, 3, 3], // type 0 - b, l, y, f, n
            [0, 1, 2, 3, 3], // type 1 - v, w
            [0, 1, 2, 3, 3], // type 2 - c, t
            [0, 1, 2, 3, 3], // type 3 - z
            [0, 0, 0, 0, 0]  // type 4 - i
        ];
    }

    // Returns the new face index for a given face, action and blocktype
    //
    // Rotation and flipping rules:
    // Pentominos: b, c, f, i ,l, n, t, v, w, x, y, z
    // Tetromino: only on 8x8 board - o
    // Type 5: - 1 face,
    //         - 1 appearance,
    //         - no rotation
    //         - no flip
    //         - 4 squares
    //         - o, x
    // Type 4: - 1 face,
    //         - 2 appearances,
    //         - 90° or 270°
    //         - i
    // Type 3: - 2 faces,
    //         - 4 appearances,
    //         - 90° or 270°
    //         - flip both directions
    //         - z
    // Type 2: - 1 face,
    //         - 4 appearances,
    //         - 90°, 180°  or 270°
    //         - flip one direction
    //         - c, t
    // Type 1: - 1 face,
    //         - 4 appearances,
    //         - 90°, 180°  or 270°
    //         - flip both directions
    //         - v, w
    // Type 0: - 2 faces
    //         - 8 appearances,
    //         - 90°, 180°  or 270°
    //         - flip both directions
    //         - b, l, y, f, n

    permute(pentomino) {
        const type = pentomino.type;
        if (type == 5) return; // no permutation for type 5

        if (((pentomino.type == 4) && (pentomino.activePart < 1)) ||
            ((pentomino.type == 3) && (pentomino.activePart < 3)) ||
            ((pentomino.type == 2) && (pentomino.activePart < 3)) ||
            (pentomino.type < 3)) {

            const oldActivePartPosition = [
                pentomino.position.x + pentomino.faces[pentomino.face][pentomino.activePart][0],
                pentomino.position.y + pentomino.faces[pentomino.face][pentomino.activePart][1]
            ];

            this._flipRotate(pentomino);

            const newActivePartPosition = [
                pentomino.position.x + pentomino.faces[pentomino.face][pentomino.activePart][0],
                pentomino.position.y + pentomino.faces[pentomino.face][pentomino.activePart][1]
            ];

            this._adjustPosition(pentomino, oldActivePartPosition, newActivePartPosition);
        }
    }

    _flipRotate(pentomino, part) {
        let permutationType = part;
        if (part == undefined) { // user action
            permutationType = this._permutationTypeLookup[pentomino.type][pentomino.activePart];
        }

        // Fix for C and T (type 2) pieces shifting: if it's a flip action (1 or 2), 
        // we swap the active part 1 and 2 because their relative positions are switched on different faces.
        // if (pentomino.type === 2 && (permutationType === 1 || permutationType === 2)) {
        //     if (pentomino.activePart === 1) {
        //         pentomino.activePart = 2;
        //     } else if (pentomino.activePart === 2) {
        //         pentomino.activePart = 1;
        //     }
        // }

        pentomino.face = this._rotable[permutationType][pentomino.type][pentomino.face];
        // switch the dimensions if pentomino is rotated;
        if (permutationType !== 1 && permutationType !== 2) {
            pentomino.dimensions.reverse();
        }
    }

    flipBoardYAxis(pentominos) {
        pentominos.forEach(pentomino => {
            this._flipRotate(pentomino, 1);
            pentomino.position.x = this.bs.getWidth() - pentomino.position.x - pentomino.dimensions[0];
        });
    }

    // 90° clockwise rotation
    rotateSquareBoard(pentominos) {
        pentominos.forEach(pentomino => {
            // bottom left of current rectangle occupied by pentomino
            const origin = {};
            origin.x = pentomino.position.x;
            origin.y = pentomino.position.y + pentomino.dimensions[1];
            // rotated position on board
            pentomino.position.x = this.bs.getWidth() - origin.y;
            pentomino.position.y = origin.x;
            // rotated pentomino
            this._flipRotate(pentomino, 0);
        });
    }

    shiftPieces(pentominos, dx, dy) {
        pentominos.forEach(pentomino => {
            pentomino.position.x += dx;
            pentomino.position.y += dy;
        });
    }

    shiftPiecesToTop(pentominos) {
        const topMostY = Math.min(...pentominos.map(pentomino => {
            return pentomino.position.y;
        }));
        this.shiftPieces(pentominos, 0, -topMostY);
    }

    // Thanks Ben Nierop, for the idea
    _adjustPosition(pentomino, oldActivePartPosition, newActivePartPosition) {
        const dx = oldActivePartPosition[0] - newActivePartPosition[0];
        const dy = oldActivePartPosition[1] - newActivePartPosition[1];
        this.shiftPieces([pentomino], dx, dy);
    }

    rotateBoard(pentominos) {
        if (this.bs.boardType == 'square') {
            this.rotateSquareBoard(pentominos);
        } else {
            // rotate twice and shift pentominos to top
            for (let i = 0; i < 2; i++) this.rotateSquareBoard(pentominos);
            this.shiftPiecesToTop(pentominos);
        }
    }

    mixBoard(pentominos) {
        const clientWidth = Math.floor(document.querySelectorAll('.dragArea')[0].clientWidth / this.bs.partSize);
        const clientHeight = Math.floor(document.querySelectorAll('.dragArea')[0].clientHeight / this.bs.partSize);
        const maxX = clientWidth - 4;
        const maxY = clientHeight - 4;
        // offset values in positions
        const offsetX = Math.floor((clientWidth - this.bs.getWidth()) / 2);
        const offsetY = Math.floor((clientHeight - this.bs.getHeight()) / 2);

        pentominos.forEach(pentomino => {
            pentomino.face = Math.floor(Math.random() * pentomino.faces.length);
            // find random off board position
            do {
                let xPos = Math.floor(Math.random() * maxX);
                xPos -= offsetX;
                let yPos = Math.floor(Math.random() * maxY);
                yPos -= offsetY;

                pentomino.position.x = xPos;
                pentomino.position.y = yPos;
            } while (this.bs.touchesBoard(pentomino));
            pentomino.onBoard = false;
        });
        this.bs.unsetSolved();
    }

}
