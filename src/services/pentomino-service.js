import {
    inject,
    bindable
} from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { DataService } from './data-service';
import { BoardService } from './board-service';
import { SolutionService } from './solution-service';

@inject(BindingSignaler, DataService, BoardService, SolutionService)
export class PentominoService {

    constructor(bindingSignaler, dataService, boardService, solutionService) {

        this.bnds = bindingSignaler;
        this.ds = dataService;
        this.bs = boardService;
        this.sls = solutionService;

        this.pentominos = [];
        this.offBoardPentominos = [];
        this.fields = [];
        this.activePentomino = null;
        this.oBlock = null;
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

    getFields() {
        return this.fields;
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

    setAllOnboard(onBoards, offBoards) {
        this.pentominos = onBoards.concat(offBoards);
        this.pentominos = this.sortPentominos(this.pentominos);
        this.registerPieces();
    }

    signalViewUpdate() {
        this.bnds.signal('position-signal');
    }

    sortPentominos(pentos) {
        pentos.sort((a, b) => {
            return a.index - b.index;
        });
        return pentos;
    }

    setPentominosOffboard() {
        this.registerPieces();
        this.offBoardPentominos = this.pentominos.filter((pento) => {
            return pento.onBoard === false;
        });
        this.pentominos = this.pentominos.filter((pento) => {
            return pento.onBoard === true;
        });
        this.registerPieces();
        return this.offBoardPentominos;
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
            let onBoardParts = 0;
            let partsCount = pentomino.faces[pentomino.face].length;
            for (let i = 0; i < partsCount; i++) {
                let x = pentomino.faces[pentomino.face][i][0] + pentomino.position.x;
                let y = pentomino.faces[pentomino.face][i][1] + pentomino.position.y;
                if (this.bs.onBoard(x, y)) {
                    this.fields[y][x] += onOff;
                    onBoardParts += 1;
                }
                pentomino.onBoard = (onBoardParts == partsCount);
            }
        }
    }

    registerPieces() {
        this.fields = this.setBoardFields(0);
        for (var i = 0; i < this.pentominos.length; i++) {
            let pentomino = this.pentominos[i];
            this.registerPiece(pentomino, 1);
            this.adjustDimensions(pentomino);
        }
        this.signalViewUpdate();
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

    setOffBoardPentominos(pentos) {
        this.offBoardPentominos = pentos;
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

    // Get the pentomino blocks
    getPentominoData() {
        return this.ds.getPentominos().then((response) => {
            return response;
        });
    }

    // Get the colors for the pentominos
    getPentominoColors() {
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

    // Remove or add the Oblock as needed for current boardType
    toggleOblock(count) {
        if (this.pentominos.length > count) {
            this.oBlock = this.pentominos.pop();
        } else {
            if (this.oBlock) {
                this.pentominos.push(this.oBlock);
                this.oBlock = null;
            }
        }
    }

    // Get the starting position for the given board type
    getStartPosition(shape) {
        return this.ds.getStartPosition(shape).then((response) => {
            this.bs.boardType = shape;
            this.sls.currentSolution = -1;
            this.sls.setShowSolutions();
            let count = response.length;
            this.toggleOblock(count);
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
