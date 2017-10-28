import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { PentominoService } from '../services/pentomino-service';

@inject(EventAggregator, PentominoService)
export class BoardCustomElement {

    constructor(eventAggregator, pentominoService) {
        this.ea = eventAggregator;
        this.ps = pentominoService;
    }

    getBoardSizeCSS() {
        let boardType = this.ps.boardTypes[this.ps.boardType];
        let css = {
            width: boardType.w * this.ps.partSize + 'px',
            height: boardType.h * this.ps.partSize + 'px'
        }
        return css;
    }

    addEventListeners() {

    }

    attached() {
        this.addEventListeners();
    }

}
