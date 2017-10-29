import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from '../services/board-service';

@inject(BoardService)
export class HeaderCustomElement {

    constructor(boardService) {
        this.bs = boardService;
        this.title = 'Pentomino';
    }

    getHeaderSizeCss() {
        let boardType = this.bs.boardTypes[this.bs.boardType];
        let css = {
            width: boardType.w * this.bs.partSize + 'px',
        }
        return css;
    }
}
