import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { BindingSignaler } from 'aurelia-templating-resources';
import { PentominoService } from '../services/pentomino-service';
import { PermutationService } from '../services/permutation-service';
import { SolverService } from '../services/solver-service';



@inject(BindingSignaler, EventAggregator, PentominoService, PermutationService, SolverService)
export class SolvingCustomElement {

    constructor(bindingSignaler, eventAggregator, pentominoService, permutationService, solverService) {
        this.bnds = bindingSignaler;
        this.ea = eventAggregator;
        this.ps = pentominoService;
        this.prms = permutationService;
        this.slvs = solverService;
        this.solvingPanelVisible = false;
        this.ea.subscribe('showSolvingPanel', response => {
            this.solvingPanelVisible = response;
        });

    }

    autoSolve() {
        this.slvs.startSolving();
    }

    continue() {
        this.slvs.continue();
    }

    nextPiece() {
        this.slvs.nextPiece();
    }

    stop() {
        this.slvs.stop();
    }
}
