import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { DataService } from './data-service';
import { BoardService } from './board-service';

@inject(EventAggregator, DataService, BoardService)
export class PentominoService {

    constructor(eventAggregator, dataService, boardService) {
        this.ea = eventAggregator;
        this.ds = dataService;
        this.bs = boardService;
        this.pentominos = [];
        this.fields = [];
        this.currentPentomino = null;
        this.part = null;
        this.getPentominoData().then((response) => {
            this.pentominos = response;
        }).then(() => {
            this.getPentominoColors();
        }).then(() => {
            this.getStartPosition('square');
        }).then(() => {
            console.log(this.pentominos);
        });
        this.setBoardFields();
    }

    isSolved() {
        let boardIsFull = this.boardIsFull();
        let solutionResult;
        if (boardIsFull) {
            solutionResult = this.isNewSolution();
            this.solved = boardIsFull;
            if (!isNaN(solutionResult)) {
                $scope.currentSolution = solutionResult;
                this.newSolution = false;
            } else {
                $scope.saveSolution(solutionResult);
                $scope.solutions[this.boardType].push(solutionResult);
                this.newSolution = true;
            }
        } else {
            this.solved = false;
        }
    }

    boardIsFull() {
        let h = this.bs.getHeight();
        let w = this.bs.getWidth();
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (this.fields[y][x] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }

    setCurrentPentomino(pentomino) {
        this.currentPentomino = pentomino;
    }

    resetCurrentPentomino() {
        this.currentPentomino = null;
        this.part = null;
    }

    setCurrentPart(part) {
        this.part = part;
    }

    alignCurrentPentomino(newX, newY) {
        this.currentPentomino.position.x = newX;
        this.currentPentomino.position.y = newY;
    };

    registerPiece(i, onOff) {
        let x, y;
        let pentomino = this.pentominos[i];
        // console.log(pentomino.name);
        if (pentomino && pentomino.faces) {
            for (let j = 0; j < pentomino.faces[pentomino.face].length; j++) {
                x = pentomino.faces[pentomino.face][j][0] + pentomino.position.x;
                y = pentomino.faces[pentomino.face][j][1] + pentomino.position.y;
                if (this.bs.onBoard(x, y)) {
                    this.fields[y][x] += onOff;
                }
            }
        }
    }

    setBoardFields() {
        let w = this.bs.getWidth();
        let h = this.bs.getHeight();
        this.fields = [];
        for (let y = 0; y < h; y++) {
            this.fields.push([]);
            for (let x = 0; x < w; x++) {
                this.fields[y].push(0);
            }
        }
    }

    getPentominoData() {
        return this.ds.getPentominos().then((response) => {
            return response;
        });
    }

    getPentominoColors() {
        // let self = this;
        return this.ds.getColors().then((response) => {
            for (let i = 0; i < this.pentominos.length; i++) {
                this.pentominos[i].color = response[i].color;
            }
        });
    }

    getStartPosition(shape) {
        return this.ds.getStartPosition(shape).then((response) => {
            for (let i = 0; i < this.pentominos.length; i++) {
                let pentomino = this.pentominos[i];
                pentomino.face = response[i].face;
                pentomino.position = response[i].position;
                pentomino.active = false;
                pentomino.index = i;
            }
        });
    }

    addEventListeners() {

    }

}
