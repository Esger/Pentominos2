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

    getHeaderSizeCss(shape) {
        let boardType = this.bs.boardTypes[shape];
        let css = {
            width: boardType.w * this.bs.partSize + 'px',
        }
        return css;
    }
}
