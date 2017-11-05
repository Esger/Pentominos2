import {
    inject,
    bindable
} from 'aurelia-framework';
import { SolverService } from '../services/solver-service';

@inject(SolverService)
export class SolvingCustomElement {

    constructor(solverService) {
        this.slvs = solverService;
    }

    continue() {
        this.slvs.continue();
    }
}
