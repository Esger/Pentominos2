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
                surface: 64,
                totalSolutions: 16368
            },
            'rectangle': {
                w: 6,
                h: 10,
                surface: 60,
                totalSolutions: 2339
            },
            'dozen': {
                w: 12,
                h: 5,
                surface: 60,
                totalSolutions: 1010
            },
            'beam': {
                w: 15,
                h: 4,
                surface: 60,
                totalSolutions: 368
            },
            'stick': {
                w: 16,
                h: 4,
                surface: 64,
                totalSolutions: 132
            },
            'twig': {
                w: 20,
                h: 3,
                surface: 60,
                totalSolutions: 2
            }
        };
        this.solved = false;
        this.newSolution = false;

        window.addEventListener('resize', () => this.calculatePartSize());
        setTimeout(() => this.calculatePartSize(), 10);
    }

    calculatePartSize() {
        const boardW = this.getWidth();
        const boardH = this.getHeight();

        // 1/3 viewport sizes
        const maxW = window.innerWidth / 3;
        const maxH = window.innerHeight / 3;

        const sizeW = maxW / boardW;
        const sizeH = maxH / boardH;

        let newSize = Math.floor(Math.min(sizeW, sizeH));

        // ensure minimum is 40
        this.partSize = Math.max(40, newSize);

        // Sync CSS variable for LESS files
        document.documentElement.style.setProperty('--part-size', this.partSize + 'px');
    }

    setSolved() {
        this.solved = true;
    }

    unsetSolved() {
        this.solved = false;
    }

    setNewSolution() {
        this.newSolution = true;
    }

    unsetNewSolution() {
        this.newSolution = false;
    }

    setBoardType(shape) {
        this.boardType = shape;
        this.calculatePartSize();
    }

    getWidth() {
        return this.boardTypes[this.boardType].w;
    }

    getHeight() {
        return this.boardTypes[this.boardType].h;
    }

    boardsCount() {
        let count = 0;
        for (let k in this.boardTypes) if (this.boardTypes.hasOwnProperty(k)) count++;
        return count;
    }

    onBoard(x, y) {
        return (x >= 0) && (x < this.getWidth()) && (y >= 0) && (y < this.getHeight());
    }

    touchesBoard(pentomino) {
        const touchesBoard = pentomino.faces[pentomino.face].some(part => this.onBoard(pentomino.position.x + part[0], pentomino.position.y + part[1]));
        return touchesBoard;
    }

}
