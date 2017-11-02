import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from './board-service';
import { PermutationService } from './permutation-service';
import { DataService } from './data-service';
import { SettingService } from '../services/setting-service';

@inject(BoardService, PermutationService, DataService, SettingService)

export class SolutionService {

    constructor(boardService, permutationService, dataService, settingService) {
        this.bs = boardService;
        this.ds = dataService;
        this.ss = settingService;
        this.prms = permutationService;
        this.boardType = this.bs.boardType;
        this.currentSolution = 0;
        this.getSolutions();
    }

    getSolutions() {
        this.solutions = this.ds.getSolutions();
        if (this.solutions[this.bs.boardType].length > 0) {
            this.ss.setShowSolutions();
        }
    }

    saveSolution(pentominos) {
        let solutionResult = this.isNewSolution(pentominos);
        // A number indicates an existing solution
        // A string indicate a new solution
        if (!isNaN(solutionResult)) {
            // show this solution
            this.currentSolution = solutionResult;
            this.bs.unsetNewSolution();
        } else {
            this.ds.saveSolution(solutionResult);
            this.solutions[this.boardType].push(solutionResult);
            this.bs.setNewSolution();
        }
    }

    isNewSolution(pentominos) {
        let isNewSolution = true;
        let rotations = (this.boardType == 'square') ? 4 : 2;
        let solutionString = this.solution2String(pentominos);
        let foundSolStr = solutionString;
        let theLength = this.solutions[this.boardType].length;

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