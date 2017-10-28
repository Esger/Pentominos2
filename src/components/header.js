import {
    inject,
    bindable
} from 'aurelia-framework';
import { PentominoService } from '../services/pentomino-service';

@inject(PentominoService)
export class HeaderCustomElement {

    constructor(pentominoService) {
        this.ps = pentominoService;
        this.title = 'Pentomino';
    }

    getHeaderSizeCss() {
        let boardType = this.ps.boardTypes[this.ps.boardType];
        let css = {
            width: boardType.w * this.ps.partSize + 'px',
        }
        return css;
    }
}
