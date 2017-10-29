import {
    inject,
    bindable
} from 'aurelia-framework';

export class BoardService {

    constructor() {
        this.partSize = 40;
        this.boardType = 'square';
        this.boardTypes = {
            'square': {
                w: 8,
                h: 8,
                surface: 64
            },
            'rectangle': {
                w: 6,
                h: 10,
                surface: 60
            },
            'dozen': {
                w: 12,
                h: 5,
                surface: 60
            },
            'beam': {
                w: 15,
                h: 4,
                surface: 60
            },
            'stick': {
                w: 16,
                h: 4,
                surface: 64
            },
            'twig': {
                w: 20,
                h: 3,
                surface: 60
            }
        };
    }

    getWidth() {
        return this.boardTypes[this.boardType].w;
    }

    getHeight() {
        return this.boardTypes[this.boardType].h;
    }

    onBoard(x, y) {
        return (x >= 0) && (x < this.getWidth()) && (y >= 0) && (y < this.getHeight());
    }

}
