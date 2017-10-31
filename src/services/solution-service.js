import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from './board-service';
import { PermutationService } from './permutation-service';
import { DataService } from './data-service';

@inject(BoardService, PermutationService, DataService)

export class SolutionService {

    constructor(boardService, permutationService, dataService) {
        this.bs = boardService;
        this.ds = dataService;
        this.prms = permutationService;
        this.currentSolution = 0;
        this.solutions = this.ds.getSolutions();
    }

    saveSolution(pentominos) {
        let solutionResult = this.isNewSolution(pentominos);
        // A number indicates an existing solution
        // A string indicate a new solution
        if (!isNaN(solutionResult)) {
            // show this solution
            this.currentSolution = solutionResult;
            this.newSolution = false;
        } else {
            this.ds.saveSolution(solutionResult);
            this.solutions[this.bs.boardType].push(solutionResult);
            this.newSolution = true;
        }
    }

    isNewSolution(pentominos) {
        let isNewSolution = true;
        let rotations = (this.bs.boardType == 'square') ? 4 : 2;
        let solutionString = this.solution2String(pentominos);
        let foundSolStr = solutionString;
        let theLength = this.solutions[this.bs.boardType].length;

        // Mirror
        for (let flip = 0; flip < 2; flip++) {
            // Rotate
            for (let rotation = 0; rotation < rotations; rotation++) {
                // Existing solutions
                for (let i = 0; i < theLength; i++) {
                    solutionString = this.solution2String(pentominos);
                    isNewSolution = isNewSolution && (this.solutions[this.bs.boardType][i] !== solutionString);
                    if (!isNewSolution) return i;
                }
                // solutionString = this.solution2String(pentominos);
                // let existingSolStr = this.solutions[this.bs.boardType[this.bs.boardType]];
                // isNewSolution = isNewSolution &&
                //     (existingSolStr !== 'undefined') &&
                //     (existingSolStr !== solutionString);
                // if (!isNewSolution) return i;

                // Return to original position the last time
                this.prms.rotateBoard(pentominos);
            }
            this.prms.flipBoardYAxis(pentominos);
        }
        return foundSolStr;
    }

    solution2String(pentominos) {
        let solutionString = "";
        let theLength = this.bs.pentominosLength();
        for (let i = 0; i < theLength; i++) {
            solutionString += this.pentomino2string(pentominos[i]);
        }
        return solutionString;
    }

    pentomino2string(pentomino) {
        let parts = [];
        if (pentomino) {
            parts.push('#' + pentomino.name);
            parts.push(pentomino.face);
            parts.push(pentomino.position.x);
            parts.push(pentomino.position.y);
            return parts.join('_');
        }
    }

}