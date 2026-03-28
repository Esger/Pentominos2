import { inject } from 'aurelia-framework';
import { BoardService } from 'services/board-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { PentominoService } from 'services/pentomino-service';
import { PermutationService } from 'services/permutation-service';
import { SolutionService } from 'services/solution-service';

@inject(BoardService, EventAggregator, PentominoService, PermutationService, SolutionService)
export class SolvingCustomElement {

    constructor(boardService, eventAggregator, pentominoService, permutationService, solutionService) {
        this.ea = eventAggregator;
        this.bs = boardService;
        this.ps = pentominoService;
        this.sls = solutionService;
        this.prms = permutationService;
        this.solvingPanelVisible = false;
        this.slvrWrkr = null;
        this.canStop = false;
        this.positionsTried = 0;
        this.ea.subscribe('showSolvingPanel', response => {
            this.solvingPanelVisible = response;
            if (!response) {
                this.stop();
            }
        });
        this.solutionsBuffer = [];
        this.backupPentominos = this.ps.pentominos.slice();
        this.alert = '';
        this.currentCount = 0;

        this.ea.subscribe('solving', isSolving => {
            if (isSolving) {
                this.updateCount();
            }
        });

        this.ea.subscribe('solution-processed', () => {
            this.updateCount();
        });

        this.ea.subscribe('board-type-changed', () => {
            this.updateCount();
        });
    }

    updateCount() {
        if (this.sls.solutions && this.sls.solutions[this.bs.boardType]) {
            this.currentCount = this.sls.solutions[this.bs.boardType].length;
        } else {
            this.currentCount = 0;
        }
    }

    get total() {
        const board = this.bs.boardTypes[this.bs.boardType];
        return board ? board.totalSolutions : 0;
    }

    get positionsLog() {
        return this.positionsTried > 1 ? Math.log10(this.positionsTried) : 0;
    }

    get solutionsFound() {
        let est = this.currentCount + this.solutionsBuffer.length;
        if (this.solutionsBuffer.length === 0) {
            this._maxSolutionsFound = this.currentCount;
        } else if (!this._maxSolutionsFound || est > this._maxSolutionsFound) {
            this._maxSolutionsFound = est;
        }
        return this._maxSolutionsFound || this.currentCount;
    }

    get solutionsShown() {
        return this.sls.currentSolution >= 0 ? this.sls.currentSolution + 1 : 0;
    }

    get solutionsInQueue() {
        return this.solutionsBuffer.length;
    }

    get noSolutions() {
        let solutions = this.sls.solutions[this.bs.boardType] || [];
        let userSolutions = this.sls.ds.userSolutions[this.bs.boardType] || [];
        return solutions.length === userSolutions.length;
    }

    get noSpaceForSolving() {

    }

    get message() {
        if (this.alert.length) {
            return this.alert;
        } else {
            return false;
        }
    }

    autoSolve() {
        this.backupPentominos = this.ps.pentominos.slice();
        this.slvrWrkr = new Worker('assets/worker/solver-worker.js');
        this.canStop = true;
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();
        this.startPosXBlock = 0;
        this.positionsTried = 0;
        this.solutionsBuffer = [];

        let targetW = this.bs.boardTypes[this.bs.boardType].defaultW;
        let targetH = this.bs.boardTypes[this.bs.boardType].defaultH;
        let isRotated = this.bs.getWidth() !== targetW;

        let clonedOn = JSON.parse(JSON.stringify(this.ps.onBoards));
        let clonedOff = JSON.parse(JSON.stringify(this.ps.offBoards));

        if (isRotated) {
            let currW = this.bs.getWidth();
            let currH = this.bs.getHeight();
            // Rotate 270 degrees clockwise to return to the original layout natively
            for (let i = 0; i < 3; i++) {
                this.prms.rotatePieces(clonedOn, currH);
                this.prms.rotatePieces(clonedOff, currH);
                let temp = currW;
                currW = currH;
                currH = temp;
            }
        }

        // Repopulate mathematical native fields matching targetW and targetH
        let fields = [];
        for (let y = 0; y < targetH; y++) {
            fields.push(new Array(targetW).fill(0));
        }
        for (let i = 0; i < clonedOn.length; i++) {
            let pentomino = clonedOn[i];
            let face = pentomino.faces[pentomino.face];
            for (let j = 0; j < face.length; j++) {
                let part = face[j];
                let x = part[0] + pentomino.position.x;
                let y = part[1] + pentomino.position.y;
                if (x >= 0 && x < targetW && y >= 0 && y < targetH) {
                    fields[y][x] = 1;
                }
            }
        }

        let workerData = {
            message: 'solve',
            boardType: this.bs.boardType,
            boardWidth: targetW,
            boardHeight: targetH,
            fields: fields,
            onBoards: clonedOn,
            offBoards: clonedOff
        };

        this.ea.publish('solving', true);
        this.slvrWrkr.postMessage(workerData);
        this.handleSolutions();

        this.slvrWrkr.onmessage = (e) => {
            let onBoards = e.data.onBoards;
            if (isRotated && onBoards && onBoards.length > 0) {
                // Return geometrically to the portrait screen dimension 90 degrees clockwise
                this.prms.rotatePieces(onBoards, targetH);
            }
            let pentominos = this.ps.sortPentominos(onBoards);
            let offBoards = e.data.offBoards;
            let message = e.data.message;
            this.positionsTried = e.data.positions;
            switch (message) {
                case 'draw':
                    this.ps.setPentominos(pentominos);
                    this.alert = '';
                    break;
                case 'solution':
                    this.alert = '';
                    setTimeout(() => { this.bufferSolution(pentominos) });
                    break;
                case 'finish':
                    this.canStop = false;
                    break;
                case 'noSolution':
                    this.alert = 'No solutions found';
                default:
                    break;
            }
        };
    }

    bufferSolution(solution) {
        this.solutionsBuffer.push(solution);
    }

    close() {
        this.ea.publish('showSolvingPanel', false);
    }

    delete() {
        this.stageBuffer = [];
        this.sls.deleteSolutions();
        this.ps.setPentominos(this.backupPentominos);
        this.ps.registerPieces();
    }

    handleSolutions() {
        let self = this;
        // Are there any solutions to 
        if (this.solutionsInQueue) {
            let pentominos = self.solutionsBuffer.shift();
            self.ps.setPentominos(pentominos);
            self.bs.setSolved();
            self.sls.saveSolution(pentominos);
        }
        if (self.canStop || self.solutionsBuffer.length) {
            requestAnimationFrame(() => { self.handleSolutions() });
        } else {
            self.sls.saveSolution();
            this.ea.publish('solving', false);
            this.alert = `${this.currentCount} solutions found!`;
        }
    }

    mixBoard() {
        this.prms.mixBoard(this.ps.pentominos);
        this.ps.registerPieces();
    }

    stop() {
        this.canStop = false;
        if (this.slvrWrkr) {
            this.slvrWrkr.terminate();
            this.ps.setPentominos(this.backupPentominos);
            this.ps.registerPieces();
        }
    }

}
