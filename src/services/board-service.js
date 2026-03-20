import {
    inject,
    bindable
} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class BoardService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
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

        for (const key in this.boardTypes) {
            this.boardTypes[key].defaultW = this.boardTypes[key].w;
            this.boardTypes[key].defaultH = this.boardTypes[key].h;
        }

        this.solved = false;
        this.newSolution = false;

        window.addEventListener('resize', () => this.calculatePartSize());
        setTimeout(() => this.calculatePartSize(), 10);
    }

    calculatePartSize() {
        const boardW = this.getWidth();
        const boardH = this.getHeight();

        // Target 80% of viewport to leave space for pieces
        const maxW = window.innerWidth * 0.71;
        const maxH = window.innerHeight * 0.71;

        const sizeW = maxW / boardW;
        const sizeH = maxH / boardH;

        let newSize = Math.floor(Math.min(sizeW, sizeH));

        // On small screens, we must allow the part size to go below 40 to fit the board.
        // We'll set a new minimum of 28px for better mobile support.
        this.partSize = Math.max(28, Math.min(newSize, 45));

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
        this.ea.publish('board-type-changed', shape);
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
