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
        this.rotable = [
            [ // rotate
                [1, 2, 3, 0, 5, 6, 7, 4], // blyfn
                [1, 2, 3, 0], // vw
                [1, 2, 3, 0], // tu
                [1, 0, 3, 2], // z
                [1, 0], // i
                [0] // xo not necessary
            ],
            [ // flip around yAxis
                [4, 7, 6, 5, 0, 3, 2, 1], // blyfn
                [3, 2, 1, 0], // vw
                [0, 3, 2, 1], // tu
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ],
            [ // flip around xAxis
                [6, 5, 4, 7, 2, 1, 0, 3], // blyfn
                [1, 0, 3, 2], // vw
                [2, 1, 0, 3], // tu
                [2, 3, 0, 1], // z
                [0, 1], // i not necessary
                [0] // xo not necessary
            ]
        ];
        this.getPentominoData().then((response) => {
            this.pentominos = response;
            this.getPentominoColors().then(() => {
                this.getStartPosition('square').then(() => {
                    this.setBoardFields(0);
                    this.registerPieces();
                    // $scope.currentSolution = 0;
                    console.log(this.pentominos);
                });
            });
        });
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
    }

    // Returns the new face index for a given face, action and blocktype
    flipRotate() {
        let pentomino = this.currentPentomino;
        pentomino.face = this.rotable[this.part][pentomino.type][pentomino.face];
        // switch the dimensions if pentomino is rotated;
        if (this.part === 0) {
            pentomino.dimensions.reverse();
        }
    }

    adjustPosition() {
        let pentomino = this.currentPentomino;
        let partRelPosition = pentomino.faces[pentomino.face][this.part];
        let partAbsPosition = [
            pentomino.position.x + partRelPosition[0],
            pentomino.position.y + partRelPosition[1]
        ];
        let partToBottom = pentomino.dimensions[1] - partRelPosition[1] - 1;
        let partToRight = pentomino.dimensions[0] - partRelPosition[0] - 1;
        switch (this.part) {
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

    registerPiece(i, onOff) {
        let pentomino = this.pentominos[i];
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
        this.solved = false;
        for (var i = 0; i < this.pentominos.length; i++) {
            this.registerPiece(i, 1);
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

    adjustDimensions(i) {
        let pentomino = this.pentominos[i];
        // if (pentomino && pentomino.initialDimensions) {
        pentomino.dimensions = pentomino.initialDimensions.slice();
        // }
        if (pentomino && pentomino.face % 2 == 1) {
            pentomino.dimensions.reverse();
        }
    }

    getStartPosition(shape) {
        return this.ds.getStartPosition(shape).then((response) => {
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
        });
    }

    addEventListeners() {

    }

}
