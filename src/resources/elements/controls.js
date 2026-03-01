import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { BoardService } from 'services/board-service';
import { SettingService } from 'services/setting-service';
import { PentominoService } from 'services/pentomino-service';
import { SolutionService } from 'services/solution-service';

@inject(BoardService, EventAggregator, SettingService, PentominoService, SolutionService)

export class ControlsCustomElement {

    constructor(boardService, eventAggregator, settingService, pentominoService, solutionService) {
        this.ea = eventAggregator;
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
        let solutionString = this.sls.solutions[this.bs.boardType][this.sls.currentSolution];
        // The string format is #name_face_x_y#name_face_x_y...
        let splitString = solutionString.substr(1).split('#');
        for (let i = 0; i < splitString.length; i++) {
            let props = splitString[i].split('_');
            let name = props[0];
            let pentomino = this.ps.pentominos.find(p => p.name === name);
            if (pentomino) {
                pentomino.face = parseInt(props[1], 10);
                pentomino.position.x = parseInt(props[2], 10);
                pentomino.position.y = parseInt(props[3], 10);

                // Ensure dimensions are synced
                this.ps.adjustDimensions(pentomino);
            }
        }
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
        this.ea.subscribe('solving', response => {
            this.disabledButtons = response;
        });
        this.ea.subscribe('move', response => {
            if (response == 1) {
                // Use requestIdleCallback to offload heavy calculations from the interaction loop
                const runSetPossible = (deadline) => {
                    if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                        // Create a lightweight, non-circular projection instead of expensive JSON clone
                        const onBoardData = this.ps.onBoards.map(p => ({
                            name: p.name,
                            type: p.type,
                            face: p.face,
                            position: { x: p.position.x, y: p.position.y },
                            dimensions: [p.dimensions[0], p.dimensions[1]]
                        }));
                        this.sls.setPossibleSolutions(onBoardData);
                    }
                };

                if (window.requestIdleCallback) {
                    window.requestIdleCallback(runSetPossible, { timeout: 100 });
                } else {
                    setTimeout(() => runSetPossible({ timeRemaining: () => 10, didTimeout: true }), 1);
                }
            }
        });
        this.ea.subscribe('keyPressed', response => {
            if (!this.disabledButtons) {
                switch (response) {
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
