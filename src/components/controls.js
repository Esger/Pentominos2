import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { BindingSignaler } from 'aurelia-templating-resources';
import { BoardService } from '../services/board-service';
import { SettingService } from '../services/setting-service';
import { PentominoService } from '../services/pentomino-service';
import { SolutionService } from '../services/solution-service';

@inject(BindingSignaler, BoardService, EventAggregator, SettingService, PentominoService, SolutionService)

export class ControlsCustomElement {

    constructor(bindingSignaler, boardService, eventAggregator, settingService, pentominoService, solutionService) {
        this.ea = eventAggregator;
        this.bnds = bindingSignaler;
        this.bs = boardService;
        this.ss = settingService;
        this.ps = pentominoService;
        this.sls = solutionService;
        this.solutionCount = this.sls.solutions[this.sls.boardType].length;
        this.disabledButtons = false;
        this.ea.subscribe('solving', response => {
            this.disabledButtons = response;
        });
    }

    getIndicatorClass() {
        let classes = ['indicator', 'rounded'];
        let solvedClass = (this.bs.solved && !this.bs.newSolution) ? 'solved' : '';
        classes.push(solvedClass);
        return classes.join(' ');
    }

    getIndicatorText(currentSolution, solutionCount) {
        let current = (currentSolution >= 0) ? 'Solution&nbsp;&nbsp;' + (currentSolution + 1) + ' / ' : 'Solutions: ';
        let text = current + solutionCount;
        return text;
    }

    showSolutions(count) {
        return count > 0;
    }

    showSolution() {
        let pentominos = this.ps.pentominos;
        let solutionString = this.sls.solutions[this.bs.boardType][this.sls.currentSolution];
        let splitString = solutionString.substr(1).split('#');
        for (let i = 0; i < splitString.length; i++) {
            let pentomino = this.ps.pentominos[i];
            let props = splitString[i].split('_');
            pentomino.face = parseInt(props[1], 10);
            pentomino.position.x = parseInt(props[2], 10);
            pentomino.position.y = parseInt(props[3], 10);
        }
        this.bnds.signal('position-signal');
        this.ps.registerPieces();
        this.bs.unsetNewSolution();
    }

    disableNextButton(current, count) {
        return (current + 1 == count) || this.disabledButtons;
    }

    disablePreviousButton(current) {
        return (current == 0) || this.disabledButtons;
    }

    showFirstSolution() {
        this.sls.currentSolution = 0;
        this.showSolution();
    }

    showPreviousSolution() {
        if (this.sls.currentSolution > 0) {
            this.sls.currentSolution--;
            this.showSolution();
        }
    }

    showNextSolution() {
        if (!this.disableNextButton(this.sls.currentSolution, this.sls.solutions[this.bs.boardType].length)) {
            this.sls.currentSolution++;
            this.showSolution();
        }
    }

}
