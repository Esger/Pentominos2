import { inject } from 'aurelia-framework';
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
            left: `calc(${x} * var(--part-size, 40px))`,
            top: `calc(${y} * var(--part-size, 40px))`,
            backgroundColor: color
        };
        return css;
    }

    getPartCSS(part) {
        let css = {
            'left': `calc(${part[0]} * var(--part-size, 40px))`,
            'top': `calc(${part[1]} * var(--part-size, 40px))`
        };
        return css;
    }

}
