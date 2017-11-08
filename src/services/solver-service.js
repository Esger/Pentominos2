import {
    TaskQueue,
    inject,
    bindable
} from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { DataService } from './data-service';
import { BoardService } from './board-service';
import { PentominoService } from './pentomino-service';
import { SolutionService } from './solution-service';
import { PermutationService } from '../services/permutation-service';

@inject(BindingSignaler, TaskQueue, DataService, BoardService, PentominoService, SolutionService, PermutationService)
export class SolverService {

    constructor(bindingSignaler, taskQueue, dataService, boardService, pentominoService, solutionService, permutationService) {
        this.bnds = bindingSignaler;
        this.ts = taskQueue;
        this.ds = dataService;
        this.bs = boardService;
        this.ps = pentominoService;
        this.sls = solutionService;
        this.prms = permutationService;
        this.pentominos = this.ps.pentominos;
        this.continue = false;

        this.positionsTried = 0;
        this.startPositionsXblock = {
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
    }

    autoSolve() {
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();

        this.prms.shiftPieces(this.pentominos, 10, 0);
        this.ps.registerPieces();
        let pentomino = this.pentominos[9];
        for (let i = 0; i < this.startPositionsXblock[this.bs.boardType].length; i++) {
            // this.ts.queueTask(() => {
            this.movePentomino(pentomino, 0, this.startPositionsXblock[this.bs.boardType][i]);
            pentomino.onBoard = true;
            this.bnds.signal('position-signal');
            this.findNextFit();
            console.log(this.positionsTried);
            // });
        }
        // console.table(this.fields);

    }

    findNextFit() {
        // this.ts.queueMicroTask(() => {
        let shiftLeft = true;
        if (!this.ps.isSolved()) {
            let firstEmpty = this.findFirstEmpty();
            let hasHole = this.isHole(firstEmpty);
            if (!hasHole) {
                let theLength = this.bs.pentominosLength();
                for (let i = 0; i < theLength; i++) {
                    let pentomino = this.pentominos[i];
                    if (!pentomino.onBoard) {
                        let lastPentomino = i;
                        for (let face = 0; face < pentomino.faces.length; face++) {
                            this.positionsTried++;
                            // shiftLeft false if face has [0,0] part
                            this.movePentomino(pentomino, face, firstEmpty, shiftLeft);
                            this.bnds.signal('position-signal');
                            pentomino.onBoard = true;
                            this.logBoard(pentomino);
                            if (this.isFitting()) {
                                this.findNextFit();
                                // this.stashPentomino(i);
                                // this.logBoard();
                            }
                        }
                        console.log('last', lastPentomino);
                        this.stashPentomino(lastPentomino);
                    }
                }
            }
        }
        // });
    }

    logBoard(pentomino) {
        console.clear();
        console.table(this.ps.fields);
        console.log('pentomino:', pentomino, 'positions:', this.positionsTried);
    }

    findFirstEmpty() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.ps.fields[y][x] === 0) return [x, y];
            }
        }
        return false;
    }

    copyBoardFields() {
        let fields = [];
        for (let y = 0; y < this.boardHeight; y++) {
            fields.push([]);
            for (let x = 0; x < this.boardWidth; x++) {
                fields[y].push(this.ps.fields[y][x]);
            }
        }
        return fields;
    }

    // find out if open region at x,y is large enough for a pentomino by recursion counting
    // xy has to be the most up left open spot
    isHole(xy) {
        let self = this;
        let holeSize = 0;
        let minHoleSize = (this.pentominos[12].onBoard || this.boardType === 'rectangle') ? 5 : 4;
        let label = 'a';
        let board = this.copyBoardFields();
        // let x = xy[0];
        let y = xy[1];

        function countDown(xy) {
            let y = xy[1];
            while ((y < self.boardHeight) && (board[y][xy[0]] === 0) && (holeSize < minHoleSize)) {
                board[y][xy[0]] = label;
                holeSize++;
                // console.table(board);
                countLeft([xy[0] - 1, y]);
                countRight([xy[0] + 1, y]);
                y++;
            }
        }

        function countRight(xy) {
            let x = xy[0];
            while ((x < self.boardWidth) && (board[xy[1]][x] === 0) && (holeSize < minHoleSize)) {
                board[xy[1]][x] = label;
                holeSize++;
                // console.table(board);
                countDown([x, xy[1] + 1]);
                x++;
            }
        }

        function countLeft(xy) {
            let x = xy[0];
            while ((x >= 0) && (board[xy[1]][x] === 0) && (holeSize < minHoleSize)) {
                board[xy[1]][x] = label;
                holeSize++;
                // console.table(board);
                countDown([x, xy[1] + 1]);
                x--;
            }
        }
        countRight(xy);
        return (holeSize < minHoleSize);
    }

    // Return true if no overlapping pieces and pieces are completely on the board
    isFitting() {
        let sum = 0;
        for (let y = 0; y < this.ps.fields.length; y++) {
            for (let x = 0; x < this.ps.fields[y].length; x++) {
                if (this.ps.fields[y][x] > 1) {
                    return false;
                } else {
                    sum += this.ps.fields[y][x];
                }
            }
        }
        if (this.pentominos[12].onBoard === true) {
            return ((sum - 4) % 5 === 0);
        } else {
            return (sum % 5 === 0);
        }
    }

    stashPentomino(i) {
        // this.ts.queueMicroTask(() => {
        let pentomino = this.pentominos[i];
        this.movePentomino(pentomino, 0, [10, 0], false);
        pentomino.onBoard = false;
        // });
        // this.logBoard();
    }

    setPosition(pentomino, position) {
        // this.ts.queueMicroTask(() => {
        pentomino.position.x = position[0];
        pentomino.position.y = position[1];
        // });
    }

    movePentomino(pentomino, face, position, shiftLeft) {
        let newPosition;
        // If left top of pentomino is empty ___|
        // move pentomino to the left
        if (shiftLeft && position[0] > 0) {
            let xShift = this.findFirstPartRight(pentomino);
            newPosition = [position[0] - xShift, position[1]];
        } else {
            newPosition = position;
        }
        this.ps.registerPiece(pentomino, -1);
        pentomino.face = face;
        this.ps.adjustDimensions(pentomino);
        this.setPosition(pentomino, newPosition);
        this.ps.registerPiece(pentomino, 1);
        // console.table($scope.board.fields);
    }

    findFirstPartRight(pentomino) {
        let offsetRight = pentomino.dimensions[0];
        let part = pentomino.faces[pentomino.face][0];
        for (let j = 0; j < pentomino.faces[pentomino.face].length; j++) {
            part = pentomino.faces[pentomino.face][j];
            offsetRight = ((part[1] === 0) && (part[0] < offsetRight)) ? part[0] : offsetRight;
        }
        return offsetRight;
    }


}
