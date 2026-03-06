import { inject } from 'aurelia-framework';
import { BoardService } from 'services/board-service';
import { SolutionService } from 'services/solution-service';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(BoardService, SolutionService, EventAggregator)
export class ProgressBarCustomElement {
    constructor(boardService, solutionService, eventAggregator) {
        this.bs = boardService;
        this.sls = solutionService;
        this.ea = eventAggregator;
        this.isSolving = false;
        this.currentCount = 0;

        this.ea.subscribe('solving', isSolving => {
            this.isSolving = isSolving;
            if (isSolving) {
                this.updateCount();
            }
        });

        this.ea.subscribe('solution-processed', () => {
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

    get progress() {
        const board = this.bs.boardTypes[this.bs.boardType];
        if (!board || !board.totalSolutions) return 0;
        const percentage = (this.currentCount / board.totalSolutions) * 100;
        return Math.min(100, Math.round(percentage));
    }
}
