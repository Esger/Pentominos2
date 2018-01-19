import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { BoardService } from '../services/board-service';
import { PentominoService } from '../services/pentomino-service';
import { SolutionService } from '../services/solution-service';

@inject(EventAggregator, BoardService, PentominoService, SolutionService)
export class SolvingCustomElement {

    constructor(eventAggregator, boardService, pentominoService, solutionService) {
        this.ea = eventAggregator;
        this.bs = boardService;
        this.ps = pentominoService;
        this.sls = solutionService;
        this.solvingPanelVisible = false;
        this.backupPentominos = this.ps.pentominos.slice();
        this.slvrWrkr = null;
        this.ea.subscribe('showSolvingPanel', response => {
            this.solvingPanelVisible = response;
        });

    }

    autoSolve() {
        this.slvrWrkr = new Worker('./src/services/solver-worker.js');
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

        this.slvrWrkr.postMessage(workerData);

        this.slvrWrkr.onmessage = (e) => {
            let pentominos = this.ps.sortPentominos(e.data.onBoards);
            let offBoards = e.data.offBoards;
            let message = e.data.message;
            switch (message) {
                case 'draw':
                    this.ps.setPentominos(pentominos);
                    break;
                case 'solution':
                    this.ps.setPentominos(pentominos);
                    this.sls.saveSolution(pentominos);
                    break;
                case 'finish':
                    this.ps.setPentominos(pentominos);
                    console.log('No more solutions found!');
                    break;
                default:
                    this.ps.setPentominos(pentominos);
                    this.ps.setAllOnboard(pentominos, offBoards);
                    break;
            }
        };
    }

    // continue() {
    //     this.slvs.continue();
    // }

    // nextPiece() {
    //     this.slvs.nextPiece();
    // }

    stop() {
        this.slvrWrkr.terminate();
        this.ps.setPentominos(this.backupPentominos);
    }
}
