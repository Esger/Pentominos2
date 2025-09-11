import { inject, bindable } from 'aurelia-framework';
import { BoardService } from './board-service';

@inject(BoardService)

export class PermutationService {

    constructor(boardService) {
        this.bs = boardService;
        this._rotable = [
            [ // rotate clockwise
                [1, 2, 3, 0, 5, 6, 7, 4], // blyfn
                [1, 2, 3, 0], // vw
                [1, 2, 3, 0], // tc
                [1, 0, 3, 2], // z
                [1, 0], // i
                [0] // xo not necessary
            ],
            [ // flip around yAxis
                [4, 7, 6, 5, 0, 3, 2, 1], // blyfn
                [3, 2, 1, 0], // vw
                [0, 3, 2, 1], // tc
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ],
            [ // flip around xAxis
                [6, 5, 4, 7, 2, 1, 0, 3], // blyfn
                [1, 0, 3, 2], // vw
                [2, 1, 0, 3], // tc
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ],
            [ // rotate counter clockwise
                [3, 0, 1, 2, 7, 4, 5, 6], // blyfn
                [3, 0, 1, 2], // vw
                [3, 0, 1, 2], // tc
                [0, 1, 2, 3], // z
                [1, 0], // i
                [0] // xo not necessary
            ]
        ];
        this._partTranslations = [
            [0, 1, 2, 3, 3],
            [0, 1, 2, 3, 3],
            [0, 1, 2, 3, 3],
            [0, 1, 2, 3, 3],
            [0, 0, 0, 0, 0]
        ];
    }

    // Returns the new face index for a given face, action and blocktype
    flipRotate(pentomino, part) {
        if (part == undefined) { // user action
            part = this._partTranslations[pentomino.type][pentomino.activePart];
        }
        pentomino.face = this._rotable[part][pentomino.type][pentomino.face];
        // switch the dimensions if pentomino is rotated;
        if (part !== 1 && part !== 2) {
            pentomino.dimensions.reverse();
        }
    }

    flipBoardYAxis(pentominos) {
        pentominos.forEach(pentomino => {
            this.flipRotate(pentomino, 1);
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
            this.flipRotate(pentomino, 0);
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
    adjustPosition(pentomino, oldActivePartPosition, newActivePartPosition) {
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

        pentominos.forEach(pentomino => {
            pentomino.face = Math.floor(Math.random() * pentomino.faces.length);
            // find random off board position
            do {
                let xPos = Math.floor(Math.random() * maxX);
                xPos -= offsetX;
                const yPos = Math.floor(Math.random() * maxY);

                pentomino.position.x = xPos;
                pentomino.position.y = yPos;
            } while (this.bs.touchesBoard(pentomino));
            pentomino.onBoard = false;
        })
    }

}
