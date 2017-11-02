import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from '../services/board-service';
import { SettingService } from '../services/setting-service';
import { PentominoService } from '../services/pentomino-service';
import { SolutionService } from '../services/solution-service';

@inject(BoardService, SettingService, PentominoService, SolutionService)

export class ControlsCustomElement {

    constructor(boardService, settingService, pentominoService, solutionService) {
        this.bs = boardService; // kan weg?
        this.ss = settingService;
        this.ps = pentominoService;
        this.sls = solutionService;
        this.pentominoCount = this.bs.pentominosLength();
        this.solutionCount = this.sls.solutions[this.sls.boardType].length;
    }

    getIndicatorClass() {
        let classes = ['indicator', 'rounded'];
        let solvedClass = (this.ss.solved && !this.ss.newSolution) ? 'solved' : '';
        classes.push(solvedClass);
        return classes.join(' ');
    }

    getIndicatorText() {
        let text = 'Solution ' + (this.sls.currentSolution + 1) + '/' + this.sls.solutions[this.sls.boardType].length;
        return text;
    }

    showSolution() {
        let pentominos = this.ps.pentominos;
        let solutionString = this.sls.solutions[this.bs.boardType][this.sls.currentSolution];
        let splitString = solutionString.substr(1).split('#');
        for (let i = 0; i < this.pentominoCount; i++) {
            let pentomino = this.ps.pentominos[i];
            let props = splitString[i].split('_')
            pentomino.face = parseInt(props[1], 10);
            pentomino.position.x = parseInt(props[2], 10);
            pentomino.position.y = parseInt(props[3], 10);
            this.ps.adjustDimensions(i);
        }
        this.ps.registerPieces();
        // this.ss.setShowSolutions();
    };

    showButton() {
        return (this.solutionCount > 0);
    }

    disableNextButton() {
        return (this.sls.currentSolution + 1 == this.solutionCount);
    }

    disablePreviousButton() {
        return (this.sls.currentSolution == 0);
    }

    showPreviousSolution() {
        if (!this.disablePreviousButton()) {
            this.sls.currentSolution--;
            this.showSolution();
        }
    };

    showNextSolution() {
        if (!this.disableNextButton()) {
            this.sls.currentSolution++;
            this.showSolution();
        }
    };

}
