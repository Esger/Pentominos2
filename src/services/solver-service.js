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
        this.oPentomino = this.ps.getPentomino('o');
        this.xPentomino = this.ps.getPentomino('x');
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

    discard(misFits) {
        let pentomino = this.ps.pentominos.pop();
        misFits.push(pentomino);
        this.ps.registerPiece(pentomino, -1);
    }

    findNextFit(offBoards) {
        return new Promise((resolve, reject) => {
            let misFits = [];
            let firstEmptyPosition = this.findFirstEmptyPosition();
            if (firstEmptyPosition) { // start trying other pentominos
                if (!this.isHole(firstEmptyPosition)) { // there was a hole not fitting a block
                    while (this.ps.getOffboardCount()) {
                        let pentomino = this.ps.nextOnboard(offBoards);
                        if (pentomino) {
                            console.log('trying ', pentomino.name);
                            const count = pentomino.faces.length;
                            for (let face = 0; face < count; face++) {
                                this.ps.movePentomino(pentomino, face, firstEmptyPosition, true);
                                this.logBoard(pentomino);
                                if (this.isFitting() && this.positionsTried < 10) {
                                    autoSolve(['next', misFits.concat(offBoards)]); // #todo nog sorteren?
                                } // else next face
                            }
                            this.discard(misFits);
                            this.logBoard(pentomino);
                        } // else next pentomino
                    }
                }
                this.discard(misFits);
                resolve(['prev']);
            } else {
                resolve(['save']);
            }
        });
    }

    autoSolve(offBoards) {
        var nextAction = (offBoards) => {
            this.findNextFit(offBoards).then((result) => {
                switch (result[0]) {
                    case 'next': this.autoSolve(result[1]);
                        break;
                    case 'save': this.sls.saveSolution(this.ps.pentominos);
                        break;
                    default: // 'prev':
                        break;
                }
            });
        };
        if (this.ps.allOffBoard()) {
            // put the x on board
            this.ps.setOnboard(this.xPentomino, false);
            let xPosition = this.getXBlockPosition();
            while (xPosition) {  //for all x positions
                this.ps.movePentomino(this.xPentomino, 0, xPosition, false);
                nextAction(offBoards);
                xPosition = this.getXBlockPosition();
            }
            console.log('all xBlockPositions tried');
        } else {
            nextAction(offBoards);
        }
    }

    startSolving() {
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();
        this.startPosXBlock = 0;
        this.positionsTried = 0;
        this.ps.setAllOffboard(); // #todo only the pieces that are not on the board !!!

        this.autoSolve(this.ps.offBoardPentominos);

        this.ps.setAllOnboard();
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
        let self = this;
        let holeSize = 0;
        let minHoleSize = (this.oPentomino.onBoard || this.boardType === 'rectangle') ? 5 : 4;
        let label = 'a';
        let board = this.copyBoardFields();
        // let x = xy[0];
        let y = xy[1];

        holeSize = countRight(xy);
        return (holeSize < minHoleSize);
    }

    noneStickingOut(sum) {
        let compensation = this.oPentomino.onBoard ? -4 : 0;
        return ((sum - compensation) % 5 === 0);
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
        return this.noneStickingOut(sum);
    }

}
