import { inject } from 'aurelia-framework';
import { DragService } from './services/drag-service';
import { KeystrokeService } from './services/keystroke-service';

@inject(Element, DragService, KeystrokeService)

export class App {
    constructor(element, dragService, keystrokeService) {
        this.element = element;
        this.ds = dragService;
        this.ks = keystrokeService;
    }

    attached() {
        this.element.addEventListener('touchmove', (e) => this.ds.doDrag(e), { passive: false });
    }

    detached() {
        this.element.removeEventListener('touchmove', (e) => this.ds.doDrag(e));
    }
}
