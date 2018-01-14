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
import { PermutationService } from './permutation-service';


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
        this.xPentomino = this.ps.getPentomino('x');
        this.slvrWrkr = new Worker('./src/services/solver-worker.js');
        this.slvrWrkr.onmessage = (e) => {
            let pentominos = e.data;
            console.log('Message received from worker: ', pentominos);
            this.ps.setAllOnboard(pentominos);
        };
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
        pentomino.onBoard = false;
        misFits.push(pentomino);
        this.ps.registerPiece(pentomino, -1);
    }

    signalViewUpdate() {
        this.bnds.signal('position-signal');
    }

    findNextFit(offBoards) {
        let misFits = [];
        const firstEmptyPosition = this.findFirstEmptyPosition();
        if (firstEmptyPosition) { // start trying other pentominos
            if (this.holeFitsXPieces(firstEmptyPosition)/* && this.positionsTried < 10000 */) {
                while (offBoards.length) {
                    const pentomino = this.ps.nextOnboard(offBoards);
                    if (pentomino) {
                        console.clear();
                        console.log('trying ', this.positionsTried, pentomino.name);
                        const count = pentomino.faces.length;
                        for (let face = 0; face < count; face++) {
                            this.positionsTried++;
                            this.ps.movePentomino(pentomino, face, firstEmptyPosition, true);
                            // make aurelia update the dom somehow
                            this.logBoard();
                            if (this.isFitting()) {
                                this.findNextFit(this.ps.sortPentominos(misFits.concat(offBoards)));
                            }
                        }
                        this.discard(misFits);
                        this.logBoard();
                    } // else next pentomino
                }
            }
            this.logBoard();
        } else {
            this.sls.saveSolution(this.ps.pentominos);
        }
        return misFits;
    }

    autoSolve(offBoards) {
        if (this.ps.allOffBoard()) {
            // put the x on board
            this.ps.setOnboard(this.xPentomino, false);
            let xPosition = this.getXBlockPosition();
            while (xPosition) {  //for all x positions
                this.ps.movePentomino(this.xPentomino, 0, xPosition, false);
                offBoards = this.findNextFit(offBoards);
                xPosition = this.getXBlockPosition();
            }
            console.log('all xBlockPositions tried');
        } else {
            offBoards = this.findNextFit(offBoards);
        }
        return offBoards;
    }

    startSolving() {
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();
        this.startPosXBlock = 0;
        this.positionsTried = 0;
        let offBoardPentominos = this.ps.setAllOffboard();

        this.slvrWrkr.postMessage(offBoardPentominos);

        // offBoardPentominos = this.autoSolve(offBoardPentominos);

        if (offBoardPentominos.length > 0) {
            console.log('No solutions found!');
        }

        // this.ps.setAllOnboard(offBoardPentominos);
    }

    logBoard() {
        let fields = this.ps.setBoardFields('');
        const blockCount = this.ps.pentominos.length;
        for (let i = 0; i < blockCount; i++) {
            const pentomino = this.ps.pentominos[i];
            const face = pentomino.faces[pentomino.face];
            const partCount = face.length;
            for (let j = 0; j < partCount; j++) {
                const x = face[j][0] + pentomino.position.x;
                const y = face[j][1] + pentomino.position.y;
                if (y < this.boardHeight && x < this.boardWidth) {
                    fields[y][x] += pentomino.name;
                }
            }
        }
        console.clear();
        console.table(fields);
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
    holeFitsXPieces(xy) {
        var self = this;
        var holeSize = 0;
        var oPentoOnboard = this.ps.oPentominoOnboard();
        // var minHoleSize = (oPentoOnboard || this.boardType === 'rectangle') ? 5 : 4;
        var label = 'a';
        var board = this.copyBoardFields();
        // let x = xy[0];
        var y = xy[1];

        var countDown = (xy) => {
            let y = xy[1];
            const x = xy[0];
            while ((y < self.boardHeight) && (board[y][x] === 0)) {
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
            while ((x < self.boardWidth) && (board[y][x] === 0)) {
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
        return this.holeFits(holeSize);
    }

    holeFits(sum) {
        let compensation = (this.ps.oPentominoOnboard() || this.boardType === 'rectangle') ? 0 : 4;
        return ((sum - compensation) % 5 === 0);
    }

    noneStickingOut(sum) {
        let compensation = (this.ps.oPentominoOnboard() || this.boardType === 'rectangle') ? 4 : 0;
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
