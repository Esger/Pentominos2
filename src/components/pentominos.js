import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { PentominoService } from '../services/pentomino-service';
import { SettingService } from '../services/setting-service';
import { DragService } from '../services/drag-service';

@inject(EventAggregator, PentominoService, SettingService, DragService)
export class PentominosCustomElement {

    constructor(eventAggregator, pentominoService, settingService, dragService) {
        this.ea = eventAggregator;
        this.ps = pentominoService;
        this.ss = settingService;
        this.ds = dragService;
    }

    getPentominoCSS(x, y, color) {
        let css = {
            left: x * this.ss.partSize + 'px',
            top: y * this.ss.partSize + 'px',
            backgroundColor: color
        }
        return css;
    }

    getPartCSS(part) {
        let css = {
            'left': part[0] * this.ss.partSize + 'px',
            'top': part[1] * this.ss.partSize + 'px'
        };
        return css;
    }

    getPentominoClasses(pentomino) {
        let classes = ['pentomino'];
        classes.push('pentomino block_' + pentomino.name);
        (pentomino.active) && (classes.push('active'));
        return classes.join(' ');
    }

    getPartClasses(pentomino, partIndex) {
        let classes = ['fa', 'part'];
        // C and T blocks don't need mirrorring around symmetric direction
        let flipH = !(this.ps.pentominos.indexOf(pentomino) === 1 &&
            pentomino.dimensions[0] > pentomino.dimensions[1] ||
            this.ps.pentominos.indexOf(pentomino) === 6 &&
            pentomino.face % 2 === 0);
        let flipV = !(this.ps.pentominos.indexOf(pentomino) === 1 &&
            pentomino.dimensions[0] < pentomino.dimensions[1] ||
            this.ps.pentominos.indexOf(pentomino) === 6 &&
            pentomino.face % 2 === 1);
        if (partIndex === 0 && pentomino.type < 5) {
            classes.push('fa-refresh');
            classes.push('rotate');
        }
        if (partIndex === 1 && pentomino.type < 4 && flipH) {
            classes.push('fa-arrows-h');
            classes.push('flipH');
        }
        if (partIndex === 2 && pentomino.type < 4 && flipV) {
            classes.push('fa-arrows-v');
            classes.push('flipV');
        }
        return classes.join(' ');
    }

    addEventListeners() {

    }

    attached() {
        this.addEventListeners();
    }

}
