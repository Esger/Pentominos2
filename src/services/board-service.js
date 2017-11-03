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
        this.solved = false;
        this.newSolution = false;
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
    }

    getWidth() {
        return this.boardTypes[this.boardType].w;
    }

    getHeight() {
        return this.boardTypes[this.boardType].h;
    }

    pentominosLength() {
        let blockCount = (this.boardType == 'square') ? 13 : 12;
        return blockCount;
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
        let isTouching = false;
        for (let i = 0; i < pentomino.faces[pentomino.face].length; i++) {
            let part = pentomino.faces[pentomino.face][i]
            let x = pentomino.position.x + part[0];
            let y = pentomino.position.y + part[1];
            if ((x >= 0) && (x <= this.getWidth()) &&
                (y >= 0) && (y <= this.getHeight())) {
                isTouching = true;
                break;
            }
        }
        return isTouching;
    }


}
