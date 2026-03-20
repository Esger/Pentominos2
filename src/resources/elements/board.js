import { inject } from 'aurelia-framework';
import { BoardService } from 'services/board-service';

@inject(BoardService)
export class BoardCustomElement {

    constructor(boardService) {
        this.bs = boardService;
    }

    getBoardSizeCSS(shape, w, h) {
        let css = {
            width: `calc(${w} * var(--part-size, 40px))`,
            flex: `0 0 calc(${h} * var(--part-size, 40px))`
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
