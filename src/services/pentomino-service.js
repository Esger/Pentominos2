import { inject, bindable } from 'aurelia-framework';
import { DataService } from './data-service';
import { BoardService } from './board-service';
import { SolutionService } from './solution-service';

@inject(DataService, BoardService, SolutionService)
export class PentominoService {

    constructor(dataService, boardService, solutionService) {
        this.ds = dataService;
        this.bs = boardService;
        this.sls = solutionService;

        this.pentominos = [];
        this.offBoardPentominos = [];
        this.fields = [];
        this._activePentomino = null;
        this.oBlock = null;
        this.start();
    }

    get offBoards() {
        let pentos = this.pentominos.filter((pento) => {
            return pento.onBoard === false;
        });
        return pentos;
    }

    get onBoards() {
        let pentos = this.pentominos.filter((pento) => {
            return pento.onBoard === true;
        });
        return pentos;
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
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (this.fields[y][x] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }

    getFields() {
        return this.fields;
    }

    getActivePentomino() {
        return this._activePentomino;
    }

    setActivePentomino(pentomino, index) {
        this._activePentomino = pentomino;
        this._activePentomino.activePart = index;
    }

    resetActivePentomino() {
        if (this._activePentomino) {
            this._activePentomino.activePart = null;
        }
        this._activePentomino = null;
    }

    setActivePentominoPosition(newX, newY) {
        this._activePentomino.position.x = newX;
        this._activePentomino.position.y = newY;
    }

    getActivePartPosition() {
        let pentomino = this._activePentomino;
        return [
            pentomino.position.x + pentomino.faces[pentomino.face][pentomino.activePart][0],
            pentomino.position.y + pentomino.faces[pentomino.face][pentomino.activePart][1]
        ];
    }

    sortPentominos(pentos) {
        pentos.sort((a, b) => {
            return a.index - b.index;
        });
        return pentos;
    }

    registerPiece(pentomino, onOff) {
        if (!pentomino) return;

        let onBoardParts = 0;
        const partsCount = pentomino.faces[pentomino.face].length;
        pentomino.faces[pentomino.face].forEach(part => {
            const x = part[0] + pentomino.position.x;
            const y = part[1] + pentomino.position.y;
            if (this.bs.onBoard(x, y)) {
                this.fields[y][x] += onOff;
                onBoardParts += 1;
            }
            pentomino.onBoard = (onBoardParts == partsCount);
        });
    }

    registerPieces() {
        this.fields = this.setBoardFields(0);
        this.pentominos.forEach(pentomino => {
            this.registerPiece(pentomino, 1);
            this.adjustDimensions(pentomino);
        });
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

    setPentominos(pentos) {
        this.pentominos = pentos;
    }

    start() {
        this.ds.getPentominos().then((response) => {
            this.pentominos = response;
            this.ds.getColors().then((response) => {
                this.pentominos.forEach((pentomino, i) => pentomino.color = response[i].color);
                this.getStartPosition().then(() => {
                    this.registerPieces();
                    this.bs.unsetSolved();
                });
            });
        });
    }

    adjustDimensions(pentomino) {
        if (!pentomino) return;
        if (pentomino.initialDimensions) {
            pentomino.dimensions = pentomino.initialDimensions.slice();
        }
        if (pentomino.face % 2 == 1) {
            pentomino.dimensions.reverse();
        }
    }

    boardHas60Squares() {
        let shape = this.bs.boardType;
        return !(shape === 'square' || shape === 'stick');
    }

    // Remove or add the Oblock as needed for current boardType
    toggleOblock() {
        if (this.boardHas60Squares()) {
            if (!this.oBlock) {
                this.oBlock = this.pentominos.pop();
            }
        } else {
            if (this.oBlock) {
                this.pentominos.push(this.oBlock);
                this.oBlock = null;
            }
        }
    }

    // Get the starting position for the given board type
    getStartPosition() {
        return this.ds.getStartPosition().then((response) => {
            this.sls.currentSolution = -1;
            let count = response.length;
            this.toggleOblock();
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
            this.registerPieces();
        });
    }

}
