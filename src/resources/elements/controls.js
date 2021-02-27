import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { BindingSignaler } from 'aurelia-templating-resources';
import { BoardService } from 'services/board-service';
import { SettingService } from 'services/setting-service';
import { PentominoService } from 'services/pentomino-service';
import { SolutionService } from 'services/solution-service';

@inject(BindingSignaler, BoardService, EventAggregator, SettingService, PentominoService, SolutionService)

export class ControlsCustomElement {

    constructor(bindingSignaler, boardService, eventAggregator, settingService, pentominoService, solutionService) {
        this.ea = eventAggregator;
        this.bnds = bindingSignaler;
        this.bs = boardService;
        this.ss = settingService;
        this.ps = pentominoService;
        this.sls = solutionService;
        this.disabledButtons = false;
        this.setSubscribers();
    }

    get solutionCount() {
        return this.sls.solutions[this.bs.boardType].length;
    }

    getIndicatorClass() {
        let classes = ['indicator', 'rounded'];
        let solvedClass = (this.bs.solved && !this.bs.newSolution) ? 'solved' : '';
        classes.push(solvedClass);
        return classes.join(' ');
    }

    get indicatorText() {
        let currentSolution = this.sls.currentSolution;
        let solutionCount = '(' + this.sls.solutions[this.bs.boardType].length + ') ';
        let possibleSolutionsCount = this.sls.getPossibleSolutionsCount();
        let possible = (possibleSolutionsCount > 0) ? possibleSolutionsCount + ' ' : '0 ';
        // console.log('possible solutions: ', possibleSolutionsCount);
        let current = (currentSolution >= 0) ? 'Solution&nbsp;&nbsp;' + (currentSolution + 1) + ' / ' : 'Solutions: ';
        let text = current + possible + solutionCount;
        return text;
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

    showLastSolution() {
        this.sls.currentSolution = this.solutionCount - 1;
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

    setSubscribers() {
        let direction = 0;
        let newDirection = 0;
        let directions = {
            'ArrowRight': 0,
            'ArrowDown': 1,
            'ArrowLeft': 2,
            'ArrowUp': 3
        };
        this.ea.subscribe('solving', response => {
            this.disabledButtons = response;
        });
        this.ea.subscribe('move', response => {
            if (response == 1) {
                setTimeout(_ => {
                    const onBoards = JSON.parse(JSON.stringify(this.ps.onBoards));
                    this.sls.setPossibleSolutions(onBoards);
                });
            }
        });
        this.ea.subscribe('keyPressed', keyName => {
            if (!this.disabledButtons) {
                switch (keyName) {
                    case 'ArrowRight': this.showNextSolution();
                        break;
                    case 'ArrowLeft': this.showPreviousSolution();
                        break;
                    case 'ArrowDown': this.showFirstSolution();
                        break;
                    case 'ArrowUp': this.showLastSolution();
                        break;
                    case ' ': this.ea.publish('pause');
                        break;
                }
            }
        });
    }


}
