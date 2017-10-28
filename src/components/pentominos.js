import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { PentominoService } from '../services/pentomino-service';

@inject(EventAggregator, PentominoService)
export class PentominosCustomElement {

    constructor(eventAggregator, pentominoService) {
        this.ea = eventAggregator;
        this.ps = pentominoService;
    }

    getPentominoCSS(position, color) {
        if (position) {
            let css = {
                left: position.x * this.ps.partSize + 'px',
                top: position.y * this.ps.partSize + 'px',
                backgroundColor: color
            }
            return css;
        }
    }

    getPartCSS(part) {
        let css = {
            'left': part[0] * this.ps.partSize + 'px',
            'top': part[1] * this.ps.partSize + 'px'
        };
        return css;
    }


    addEventListeners() {

    }

    attached() {
        this.addEventListeners();
    }

}
