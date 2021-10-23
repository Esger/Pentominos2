import {
    inject,
    bindable
} from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { BoardService } from 'services/board-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { PentominoService } from 'services/pentomino-service';
import { PermutationService } from 'services/permutation-service';
import { SolutionService } from 'services/solution-service';

@inject(BindingSignaler, BoardService, EventAggregator, PentominoService, PermutationService, SolutionService)
export class SolvingCustomElement {

    constructor(bindingSignaler, boardService, eventAggregator, pentominoService, permutationService, solutionService) {
        this.ea = eventAggregator;
        this.bnds = bindingSignaler;
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
        this.shuffled = false;
    }

    get solutionsInQueue() {
        return this.solutionsBuffer.length;
    }

    get noSolutions() {
        return this.sls.solutions[this.bs.boardType].length === 0;
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
        let workerData = {
            message: 'solve',
            boardType: this.bs.boardType,
            boardWidth: this.bs.getWidth(),
            boardHeight: this.bs.getHeight(),
            fields: this.ps.getFields(),
            onBoards: this.ps.onBoards,
            offBoards: this.ps.offBoards
        };

        this.ea.publish('solving', true);
        this.slvrWrkr.postMessage(workerData);
        this.handleSolutions();

        this.slvrWrkr.onmessage = (e) => {
            let pentominos = this.ps.sortPentominos(e.data.onBoards);
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
                    this.alert = 'No more solutions found!';
                    this.canStop = false;
                    this.ea.publish('solving', false);
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
        }
    }

    mixBoard() {
        this.shuffled = true;
        this.prms.mixBoard(this.ps.pentominos);
        this.ps.registerPieces();
        this.bnds.signal('position-signal');
    }

    stop() {
        this.canStop = false;
        this.ea.publish('solving', false);
        if (this.slvrWrkr) {
            this.slvrWrkr.terminate();
            this.ps.setPentominos(this.backupPentominos);
            this.ps.registerPieces();
        }
    }

}
