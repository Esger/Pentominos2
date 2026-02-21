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
            width: `calc(${boardType.w} * var(--part-size, 40px))`,
            flex: `0 0 calc(${boardType.h} * var(--part-size, 40px))`
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
