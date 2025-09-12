import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { PentominoService } from 'services/pentomino-service';
import { SettingService } from 'services/setting-service';
import { DragService } from 'services/drag-service';

@inject(EventAggregator, PentominoService, SettingService, DragService)
export class PentominosCustomElement {

    constructor(eventAggregator, pentominoService, settingService, dragService) {
        this.ea = eventAggregator;
        this.ps = pentominoService;
        this.ss = settingService;
        this.ds = dragService;
        this.isSolving = false;
    }

    attached() {
        this.solvingSubscription = this.ea.subscribe('solving', response => {
            this.isSolving = response;
        });
    }

    detached() {
        this.solvingSubscription.dispose();
    }

    // Todo use value converters instead of getters

    getPentominoCSS(x, y, color) {
        let css = {
            left: x * this.ss.partSize + 'px',
            top: y * this.ss.partSize + 'px',
            backgroundColor: color
        };
        return css;
    }

    getPartCSS(part) {
        let css = {
            'left': part[0] * this.ss.partSize + 'px',
            'top': part[1] * this.ss.partSize + 'px'
        };
        return css;
    }

}
