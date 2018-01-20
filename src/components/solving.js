import {
    inject,
    bindable
} from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { BoardService } from '../services/board-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { PentominoService } from '../services/pentomino-service';
import { PermutationService } from '../services/permutation-service';
import { SolutionService } from '../services/solution-service';

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
        });
        this.solutionsBuffer = [];
    }

    autoSolve() {
        this.backupPentominos = this.ps.pentominos.slice();
        this.slvrWrkr = new Worker('./src/services/solver-worker.js');
        this.canStop = true;
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();
        this.startPosXBlock = 0;
        this.positionsTried = 0;
        let workerData = {
            message: 'solve',
            boardType: this.bs.boardType,
            boardWidth: this.bs.getWidth(),
            boardHeight: this.bs.getHeight(),
            offBoards: this.ps.setPentominosOffboard(),
            fields: this.ps.getFields(),
            onBoards: this.ps.pentominos
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
                    break;
                case 'solution':
                    setTimeout(() => { this.bufferSolution(pentominos) });
                    break;
                case 'finish':
                    // this.ps.setPentominos(pentominos);
                    this.canStop = false;
                    this.ea.publish('solving', false);
                    console.log('No more solutions found!');
                    break;
                default:
                    break;
            }
        };
    }

    bufferSolution(solution) {
        this.solutionsBuffer.push(solution);
    }

    handleSolutions() {
        let self = this;
        if (self.solutionsBuffer.length) {
            let pentominos = self.solutionsBuffer.shift();
            self.ps.setPentominos(pentominos);
            self.bs.setSolved();
            self.sls.saveSolution(pentominos);
        }
        if (self.canStop || self.solutionsBuffer.length) {
            requestAnimationFrame(() => { self.handleSolutions() });
        }
    }

    mixBoard() {
        this.prms.mixBoard(this.ps.pentominos);
        this.ps.registerPieces();
        this.bnds.signal('position-signal');
    }

    close() {
        this.solvingPanelVisible = false;
    }

    stop() {
        this.canStop = false;
        this.ea.publish('solving', false);
        this.slvrWrkr.terminate();
        this.ps.setPentominos(this.backupPentominos);
    }
}
