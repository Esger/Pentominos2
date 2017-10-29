import {
    inject,
    bindable
} from 'aurelia-framework';
import { DragService } from './services/drag-service';

@inject(DragService)

export class App {
    constructor(dragService) {
        this.ds = dragService;
    }
}