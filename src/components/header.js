import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from '../services/board-service';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(BoardService, EventAggregator)
export class HeaderCustomElement {

    constructor(boardService, eventAggregator) {
        this.bs = boardService;
        this.ea = eventAggregator;
        this.title = 'Pentomino';
        this.moves = 0;
        this.ea.subscribe('move', (result) => {
            (result > 0) ? this.moves++ : this.moves = 0;
        });
    }

    getHeaderSizeCss(shape) {
        let boardType = this.bs.boardTypes[shape];
        let css = {
            width: boardType.w * this.bs.partSize + 'px',
        }
        return css;
    }

    resetMoves() {
        this.ea.publish('move', 0);
    }
}
