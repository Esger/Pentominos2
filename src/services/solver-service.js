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

        this.pentominosOnBoard = 0;
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
        this.startPosXBlock = 0;
    }

    autoSolve() {
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();
        this.startPosXBlock = 0;

        this.ps.setAllOffboard(); // #todo only the pieces that are not on the board !!!

        this.findNextFit();

        this.ps.setAllOnboard();
    }

    getXBlockPosition() {
        if (this.startPosXBlock < this.startPositionsXblock[this.bs.boardType].length) {
            let position = this.startPositionsXblock[this.bs.boardType][this.startPosXBlock].slice();
            this.startPosXBlock += 1;
            return position;
        } else {
            return false;
        }
    }

    getNextOffBoardPentomino(currentIndex) {
        let nextIndex = currentIndex + 1;
        let pentomino = this.ps.offBoardPentominos[nextIndex];
        return pentomino;
    }

    findNextFit() {
        this.positionsTried = 0;
        if (this.ps.allOffBoard()) {
            // put the x on board
            let xPosition = this.getXBlockPosition();
            if (xPosition) {
                let xPentomino = this.pentominos.find((pento) => { return pento.name === 'x'; });
                this.ps.setOnboard(xPentomino, false);
                this.movePentomino(xPentomino, 0, xPosition, false);
                this.findNextFit();
                this.ps.setOffboard(xPentomino, false);
            } else {
                console.log('all xBlockPositions tried');
            }
        } else {
            let firstEmptyPosition = this.findFirstEmptyPosition();
            if (firstEmptyPosition) {
                // start trying other pentominos
                if (!this.isHole(firstEmptyPosition)) {
                    let currentIndex = this.ps.getCurrentOffboardIndex();
                    let offBoardCount = this.ps.getOffboardCount();
                    while (currentIndex < offBoardCount - 1) {
                        let pentomino = this.getNextOffBoardPentomino(currentIndex);
                        if (pentomino) {
                            this.ps.setOnboard(pentomino, true);
                            for (let face = 0; face < pentomino.faces.length; face++) {
                                this.movePentomino(pentomino, face, firstEmptyPosition, true);
                                this.logBoard(pentomino);
                                if (this.isFitting() && this.positionsTried < 10) {
                                    this.findNextFit();
                                    this.logBoard(pentomino);
                                } // else next face or pentomino
                            }
                            this.ps.setOffboard(pentomino, true);
                            this.logBoard(pentomino);
                        }
                        currentIndex += 1;
                    }
                } // else there was a hole not fitting a block
            } else {
                // solution found -> save it
                let pentominos = this.ps.getOnboardPentominos();
                this.sls.saveSolution(pentominos);
            }
        }
    }

    logBoard(pentomino) {
        console.clear();
        console.table(this.ps.fields);
        console.log('pentomino:', pentomino, 'positions:', this.positionsTried);
    }

    findFirstEmptyPosition() {
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

    // Return true if no overlapping pieces and all pieces are completely on the board
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

    stashPentomino(pentomino) {
        // this.ts.queueMicroTask(() => {
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
        this.ps.setFace(pentomino, face);
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
