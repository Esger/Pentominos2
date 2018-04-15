import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from 'services/board-service';

@inject(BoardService)

export class BoardCustomElement {

    constructor(boardService) {
        this.bs = boardService;
    }

    getBoardSizeCSS(shape) {
        let boardType = this.bs.boardTypes[shape];
        let css = {
            width: boardType.w * this.bs.partSize + 'px',
            height: boardType.h * this.bs.partSize + 'px'
        };
        return css;
    }

    getBoardClasses(newSolution) {
        let classes = ['board'];
        let solvedClass = (newSolution) ? 'solved' : '';
        classes.push(solvedClass);
        return classes.join(' ');
    }

}
