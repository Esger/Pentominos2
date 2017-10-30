import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from './board-service';

@inject(BoardService)

export class PermutationService {

    constructor(boardService) {
        this.bs = boardService;
        this.rotable = [
            [ // rotate
                [1, 2, 3, 0, 5, 6, 7, 4], // blyfn
                [1, 2, 3, 0], // vw
                [1, 2, 3, 0], // tu
                [1, 0, 3, 2], // z
                [1, 0], // i
                [0] // xo not necessary
            ],
            [ // flip around yAxis
                [4, 7, 6, 5, 0, 3, 2, 1], // blyfn
                [3, 2, 1, 0], // vw
                [0, 3, 2, 1], // tu
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ],
            [ // flip around xAxis
                [6, 5, 4, 7, 2, 1, 0, 3], // blyfn
                [1, 0, 3, 2], // vw
                [2, 1, 0, 3], // tu
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ]
        ];
    }

    // Returns the new face index for a given face, action and blocktype
    flipRotate(pentomino) {
        pentomino.face = this.rotable[pentomino.activePart][pentomino.type][pentomino.face];
        // switch the dimensions if pentomino is rotated;
        if (pentomino.activePart === 0) {
            pentomino.dimensions.reverse();
        }
    }

    flipBoardYAxis(pentominos) {
        let pentomino;
        for (let i = 0; i < pentominos.length; i++) {
            pentomino = pentominos[i];
            this.flipRotate(pentomino, 1);
            pentomino.position.x = this.bs.getWidth() - pentomino.position.x - pentomino.dimensions[0];
        }
    }

    // 90° clockwise rotation
    rotateSquareBoard(pentominos) {
        let pentomino;
        let origin = {};
        for (let i = 0; i < pentominos.length; i++) {
            pentomino = pentominos[i];
            // bottom left of current rectangle occupied by pentomino
            origin.x = pentomino.position.x;
            origin.y = pentomino.position.y + pentomino.dimensions[1];
            // rotated position in board
            pentomino.position.x = this.bs.getWidth() - origin.y;
            pentomino.position.y = origin.x;
            // rotated pentomino
            this.flipRotate(pentomino, 0);
        }
    }

    shiftPieces(pentominos, dx, dy) {
        for (let i = 0; i < $scope.pentominos.length; i++) {
            $scope.pentominos[i].position.y += 4;
        }
    }

    rotateBoard(pentominos) {
        if (this.bs.boardType == 'square') {
            this.rotateSquareBoard(pentominos);
        } else {
            // rotate twice and shift pentominos 4 positions down
            for (let i = 0; i < 2; i++) this.rotateSquareBoard(pentominos);
            this.shiftPieces(pentominos, 0, 4);
        }
        // console.log($scope.pentominos[12]);
    }

}
