import {
    inject,
    bindable
} from 'aurelia-framework';
import { DragService } from './services/drag-service';
import { KeystrokeService } from './services/keystroke-service';

@inject(DragService, KeystrokeService)

export class App {
    constructor(dragService, keystrokeService) {
        this.ds = dragService;
        this.ks = keystrokeService;
    }
}