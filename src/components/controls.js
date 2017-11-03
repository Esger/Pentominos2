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
        let solvedClass = (this.bs.solved && !this.bs.newSolution) ? 'solved' : '';
        classes.push(solvedClass);
        return classes.join(' ');
    }

    getIndicatorText(currentSolution, solutionCount) {
        let text = 'Solution ' + (currentSolution + 1) + '/' + solutionCount;
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
        this.bs.unsetNewSolution();
    };

    showButton() {
        return (this.solutionCount > 0);
    }

    disableNextButton(current, count) {
        return (current + 1 == count);
    }

    disablePreviousButton(current) {
        return (current == 0);
    }

    showPreviousSolution() {
        if (!this.disablePreviousButton(this.sls.currentSolution)) {
            this.sls.currentSolution--;
            this.showSolution();
        }
    };

    showNextSolution() {
        if (!this.disableNextButton(this.sls.currentSolution, this.sls.solutions[this.bs.boardType].length)) {
            this.sls.currentSolution++;
            this.showSolution();
        }
    };

}
