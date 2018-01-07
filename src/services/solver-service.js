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
        this.offBoardPentominos = [];
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

    getXBlockPosition() {
        if (this.startPosXBlock < this.startPositionsXblock[this.bs.boardType].length) {
            let position = this.startPositionsXblock[this.bs.boardType][this.startPosXBlock].slice();
            this.startPosXBlock += 1;
            return position;
        } else {
            return false;
        }
    }

    getPentomino(name) {
        return this.pentominos.find((pento) => { return pento.name === name; });
    }

    setAllOnboard() {
        this.pentominos = this.pentominos.concat(this.offBoardPentominos);
        this.pentominos.sort((a, b) => {
            return a.index - b.index;
        });
        this.ps.registerPieces();
    }

    setOnboard(pentomino) {
        this.pentominos.push(pentomino);
        let index = this.offBoardPentominos.indexOf(pentomino);
        this.offBoardPentominos.splice(index, 1);
    }

    nextOnboard(offBoards) {
        let pentomino = offBoards.shift();
        this.pentominos.push(pentomino);
        this.ps.registerPiece(pentomino, 1);
        this.bnds.signal('position-signal');
        return pentomino;
    }

    setAllOffboard() {
        this.offBoardPentominos = this.pentominos.slice();
        this.pentominos = [];
        this.ps.registerPieces();
    }

    discard(misFits) {
        let pentomino = this.pentominos.pop();
        this.misFitPentominos.push(pentomino);
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
                                this.movePentomino(pentomino, face, firstEmptyPosition, true);
                                this.logBoard(pentomino);
                                if (this.isFitting() && this.positionsTried < 10) {
                                    resolve(['next', misFits.concat(offBoards)]); // #todo nog sorteren?
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
                    case 'save': this.sls.saveSolution(this.pentominos);
                        break;
                    default: // 'prev':
                        break;
                }
            });
        };
        if (this.ps.allOffBoard()) {
            // put the x on board
            let xPentomino = this.getPentomino('x');
            this.setOnboard(xPentomino, false);
            xPosition = this.getXBlockPosition();
            while (xPosition) {  //for all x positions
                this.ps.movePentomino(xPentomino, 0, xPosition, false);
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
        this.setAllOffboard(); // #todo only the pieces that are not on the board !!!

        this.autoSolve(this.offBoardPentominos);

        this.setAllOnboard();
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

}
