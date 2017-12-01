import {
    TaskQueue,
    inject,
    bindable
} from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { DataService } from './data-service';
import { BoardService } from './board-service';
import { SolutionService } from './solution-service';

@inject(BindingSignaler, TaskQueue, DataService, BoardService, SolutionService)
export class PentominoService {

    constructor(bindingSignaler, taskQueue, dataService, boardService, solutionService) {

        this.bnds = bindingSignaler;
        this.ts = taskQueue;
        this.ds = dataService;
        this.bs = boardService;
        this.sls = solutionService;

        this.pentominos = [];
        this.offBoardPentominos = [];
        this.fields = [];
        this.activePentomino = null;
        this.currentPentomino = null;
        this.lastTriedIndex = -1;
        this.start();
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

    getActivePentomino() {
        return this.activePentomino;
    }

    setActivePentomino(pentomino, index) {
        this.activePentomino = pentomino;
        this.activePentomino.activePart = index;
    }

    resetActivePentomino() {
        if (this.activePentomino) {
            this.activePentomino.activePart = null;
        }
        this.activePentomino = null;
    }

    setActivePentominoPosition(newX, newY) {
        this.activePentomino.position.x = newX;
        this.activePentomino.position.y = newY;
    }

    // getCurrentPentomino() {
    //     return this.currentPentomino;
    // }

    // setCurrentPentomino(pentomino) {
    //     this.currentPentomino = pentomino;
    // }

    // resetCurrentPentomino() {
    //     this.currentPentomino = null;
    // }

    setAllOnboard() {
        this.pentominos = this.pentominos.concat(this.offBoardPentominos);
        this.pentominos.sort((a, b) => {
            return a.index - b.index;
        });
        this.registerPieces();
    }

    setOnboard(pentomino, setLastTried) {
        this.pentominos.push(pentomino);
        let index = this.offBoardPentominos.indexOf(pentomino);
        this.offBoardPentominos.splice(index, 1);
        if (setLastTried) {
            this.lastTriedIndex = index;
        }
        this.bnds.signal('position-signal');
    }

    setAllOffboard() {
        this.offBoardPentominos = this.pentominos.slice();
        this.pentominos = [];
        this.registerPieces();
    }

    setOffboard(pentomino, setNextLastTried) {
        this.offBoardPentominos.push(pentomino);
        this.offBoardPentominos.splice(this.lastTriedIndex, 0, pentomino);
        this.pentominos.pop();
        this.registerPiece(pentomino, 1);
        if (setNextLastTried) {
            this.lastTriedIndex += 1;
        }
    }

    allOffBoard() {
        let emptyBoard = this.pentominos.length == 0;
        return emptyBoard;
    }

    getCurrentOffboardIndex() {
        return this.lastTriedIndex;
    }

    getOffboardCount() {
        return this.offBoardPentominos.length;
    }

    getNextOffboardPentomino() {
        let index = this.lastTriedIndex + 1;
        if (this.offBoardPentominos.length > index) {
            return this.offBoardPentominos[index];
        } else {
            return null;
        }
    }

    getOnboardPentominos() {
        return this.pentominos;
    }

    adjustPosition() {  // Thanks Ben Nierop, for the idea
        let pentomino = this.activePentomino;
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
        if (pentomino) {
            // let onBoardParts = 0;
            let partsCount = pentomino.faces[pentomino.face].length;
            for (let i = 0; i < partsCount; i++) {
                let x = pentomino.faces[pentomino.face][i][0] + pentomino.position.x;
                let y = pentomino.faces[pentomino.face][i][1] + pentomino.position.y;
                if (this.bs.onBoard(x, y)) {
                    this.fields[y][x] += onOff;
                    // onBoardParts += 1;
                }
                // pentomino.onBoard = (onBoardParts == partsCount);
            }
            this.bnds.signal('position-signal');
        }
    }

    registerPieces() {
        this.fields = this.setBoardFields(0);
        for (var i = 0; i < this.pentominos.length; i++) {
            let pentomino = this.pentominos[i];
            this.registerPiece(pentomino, 1);
            this.adjustDimensions(pentomino);
        }
        this.bnds.signal('position-signal');
    }

    setBoardFields(content) {
        let w = this.bs.getWidth();
        let h = this.bs.getHeight();
        let fields = [];
        for (let y = 0; y < h; y++) {
            fields.push([]);
            for (let x = 0; x < w; x++) {
                fields[y].push(content);
            }
        }
        return fields;
    }

    start() {
        this.getPentominoData().then((response) => {
            this.pentominos = response;
            this.getPentominoColors().then(() => {
                this.getStartPosition(this.bs.boardType).then(() => {
                    this.registerPieces();
                    this.solved = false;
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

    setFace(pentomino, face) {
        pentomino.face = face;
        this.adjustDimensions(pentomino);
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
            this.sls.currentSolution = -1;
            this.sls.setShowSolutions();
            let count = response.length;
            for (let i = 0; i < count; i++) {
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
            while (this.pentominos.length < count) {
                this.pentominos.pop();
            }
            this.registerPieces();
        });
    }

}
