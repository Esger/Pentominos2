import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { DataService } from './data-service';
import { BoardService } from './board-service';
import { SolutionService } from './solution-service';

@inject(EventAggregator, DataService, BoardService, SolutionService)
export class PentominoService {

    constructor(eventAggregator, dataService, boardService, solutionService) {
        this.ea = eventAggregator;
        this.ds = dataService;
        this.bs = boardService;
        this.sls = solutionService;
        this.pentominos = [];
        this.fields = [];
        this.currentPentomino = null;
        this.start();
    }

    pentominoCount() {
        return this.pentominos.length;
    }

    isSolved() {
        let boardIsFull = this.boardIsFull();
        if (boardIsFull) {
            this.bs.setSolved();
            this.sls.saveSolution(this.pentominos);
        } else {
            this.bs.unsetNewSolution();
            this.bs.unsetSolved();
        }
    }

    boardIsFull() {
        let h = this.bs.getHeight();
        let w = this.bs.getWidth();
        // console.table(this.fields);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (this.fields[y][x] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }

    setCurrentPentomino(pentomino, index) {
        this.currentPentomino = pentomino;
        this.currentPentomino.activePart = index;
    }

    resetCurrentPentomino() {
        if (this.currentPentomino) {
            this.currentPentomino.activePart = null;
            this.currentPentomino = null;
        }
    }

    alignCurrentPentomino(newX, newY) {
        this.currentPentomino.position.x = newX;
        this.currentPentomino.position.y = newY;
    }

    adjustPosition() {
        let pentomino = this.currentPentomino;
        let partRelPosition = pentomino.faces[pentomino.face][pentomino.activePart];
        let partAbsPosition = [
            pentomino.position.x + partRelPosition[0],
            pentomino.position.y + partRelPosition[1]
        ];
        let partToBottom = pentomino.dimensions[1] - partRelPosition[1] - 1;
        let partToRight = pentomino.dimensions[0] - partRelPosition[0] - 1;
        switch (pentomino.activePart) {
            case 0:
                pentomino.position.x = partAbsPosition[0] - partToBottom;
                pentomino.position.y = partAbsPosition[1] - partRelPosition[0];
                break;
            case 1:
                pentomino.position.x = partAbsPosition[0] - partToRight;
                break;
            case 2:
                pentomino.position.y = partAbsPosition[1] - partToBottom;
                break;
        }
    }

    registerPiece(pentomino, onOff) {
        // console.log(pentomino.name);
        if (pentomino && pentomino.faces) {
            for (let j = 0; j < pentomino.faces[pentomino.face].length; j++) {
                let x = pentomino.faces[pentomino.face][j][0] + pentomino.position.x;
                let y = pentomino.faces[pentomino.face][j][1] + pentomino.position.y;
                if (this.bs.onBoard(x, y)) {
                    this.fields[y][x] += onOff;
                }
            }
        }
    }

    registerPieces() {
        this.setBoardFields(0);
        for (var i = 0; i < this.pentominos.length; i++) {
            let pentomino = this.pentominos[i]
            this.registerPiece(pentomino, 1);
            this.adjustDimensions(pentomino);
        }
    }

    setBoardFields(content) {
        let w = this.bs.getWidth();
        let h = this.bs.getHeight();
        this.fields = [];
        for (let y = 0; y < h; y++) {
            this.fields.push([]);
            for (let x = 0; x < w; x++) {
                this.fields[y].push(content);
            }
        }
    }

    start() {
        this.getPentominoData().then((response) => {
            this.pentominos = response;
            this.getPentominoColors().then(() => {
                this.getStartPosition(this.bs.boardType).then(() => {
                    this.setBoardFields(0);
                    this.registerPieces();
                    this.solved = false;
                    this.sls.currentSolution = 0;
                    console.log(this.pentominos);
                });
            });
        });
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

    adjustDimensions(pentomino) {
        if (pentomino && pentomino.initialDimensions) {
            pentomino.dimensions = pentomino.initialDimensions.slice();
        }
        if (pentomino && pentomino.face % 2 == 1) {
            pentomino.dimensions.reverse();
        }
    }

    getStartPosition(shape) {
        return this.ds.getStartPosition(shape).then((response) => {
            this.bs.boardType = shape;
            this.sls.currentSolution = 0;
            this.sls.setShowSolutions();
            for (let i = 0; i < this.pentominos.length; i++) {
                let pentomino = this.pentominos[i];
                pentomino.face = response[i].face;
                pentomino.position = response[i].position;
                pentomino.active = false;
                pentomino.index = i;
                if (!pentomino.initialDimensions) {
                    pentomino.initialDimensions = pentomino.dimensions.slice();
                } else {
                    pentomino.dimensions = pentomino.initialDimensions.slice();
                }
                if (pentomino.face % 2 == 1) {
                    pentomino.dimensions.reverse();
                }
            }
            this.registerPieces();
        });
    }

}
