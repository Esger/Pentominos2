import {
    inject,
    bindable
} from 'aurelia-framework';
import { DataService } from './data-service';
import { BoardService } from './board-service';
import { PentominoService } from './pentomino-service';
import { SolutionService } from './solution-service';

@inject(DataService, BoardService, PentominoService, SolutionService)
export class SolverService {

    constructor(dataService, boardService, pentominoService, solutionService) {
        this.ds = dataService;
        this.bs = boardService;
        this.ps = pentominoService;
        this.sls = solutionService;

        this.slvrWrkr = new Worker('./src/services/solver-worker.js');
    }

    startSolving() {
        this.boardWidth = this.bs.getWidth();
        this.boardHeight = this.bs.getHeight();
        this.startPosXBlock = 0;
        this.positionsTried = 0;
        let workerData = {
            message: 'solve',
            boardType: this.bs.boardType,
            boardWidth: this.bs.getWidth(),
            boardHeight: this.bs.getWidth(),
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
                    // this.ps.signalViewUpdate();
                    break;
                case 'solution':
                    this.sls.saveSolution(pentominos);
                    break;
                case 'none':
                    this.ps.setAllOnboard(pentominos, offBoards);
                    console.log('No solutions found!');
                    break;
                default:
                    this.ps.setAllOnboard(pentominos, offBoards);
                    break;
            }
        };
    }

    stop() {
        let workerData = {
            message: 'stop'
        };
        this.slvrWrkr.postMessage(workerData);
    }
}
