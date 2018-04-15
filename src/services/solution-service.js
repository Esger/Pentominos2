import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from './board-service';
import { PermutationService } from './permutation-service';
import { DataService } from './data-service';
import { SettingService } from './setting-service';

@inject(BoardService, PermutationService, DataService, SettingService)

export class SolutionService {

    constructor(boardService, permutationService, dataService, settingService) {
        this.bs = boardService;
        this.ds = dataService;
        this.ss = settingService;
        this.prms = permutationService;
        this.possibleSolutions = [];
        this.currentSolution = -1;
        this.getSolutions();
    }

    getSolutions() {
        this.solutions = this.ds.getSolutions();
    }

    setPossibleSolutions(onBoardPentominos) {
        const rotations = (this.bs.boardType == 'square') ? 4 : 2;
        let solutions = this.solutions[this.bs.boardType];
        let flipRotatedOnboardStrings = [];

        // Mirror
        for (let flip = 0; flip < 2; flip++) {
            // Rotate
            for (let rotation = 0; rotation < rotations; rotation++) {
                let onBoardStrings = onBoardPentominos.map(pentomino => {
                    return this.pentomino2string(pentomino);
                });
                flipRotatedOnboardStrings.push(onBoardStrings);
                this.prms.rotateBoard(onBoardPentominos);
            }
            this.prms.flipBoardYAxis(onBoardPentominos);
        }

        let containsAll = (solution) => {
            let results = flipRotatedOnboardStrings.map(onBoardStringsArr => {
                let result = true;
                onBoardStringsArr.forEach(str => {
                    result = solution.includes(str) && result;
                });
                return result;
            });
            return results.some(result => {
                return result;
            });
        };
        this.possibleSolutions = solutions.filter(solution => {
            return containsAll(solution);
        });
    }

    getPossibleSolutionsCount() {
        return this.possibleSolutions.length;
    }

    deleteSolutions() {
        this.ds.deleteSolutions();
        this.getSolutions();
    }

    saveSolution(pentominos) {
        if (pentominos) {
            let solutionResult = this.isNewSolution(pentominos);
            // A number indicates an existing solution
            // A string indicate a new solution
            if (!isNaN(solutionResult)) {
                // show this solution
                this.currentSolution = solutionResult;
                this.bs.unsetNewSolution();
            } else {
                this.solutions[this.bs.boardType].push(solutionResult);
                this.currentSolution = this.solutions[this.bs.boardType].length - 1;
                this.bs.setNewSolution();
                this.ds.saveSolution(solutionResult);
            }
        } else {
            this.ds.saveSolution();
        }
    }

    findSolution(solutionString) {
        return this.solutions[this.bs.boardType].indexOf(solutionString);
    }

    isNewSolution(pentominos) {
        const rotations = (this.bs.boardType == 'square') ? 4 : 2;
        const foundSolStr = this.solution2String(pentominos);
        // use .split() to create arrays
        // Mirror
        for (let flip = 0; flip < 2; flip++) {
            // Rotate
            for (let rotation = 0; rotation < rotations; rotation++) {
                // Existing solutions
                let solutionString = this.solution2String(pentominos);
                let solNr = this.findSolution(solutionString);
                if (solNr >= 0) {
                    return solNr;
                }
                this.prms.rotateBoard(pentominos);
            }
            this.prms.flipBoardYAxis(pentominos);
        }
        return foundSolStr;
    }

    solution2String(pentominos) {
        let solutionString = "";
        const count = pentominos.length;
        let i = 0;
        for (; i < count; i++) {
            let pentomino = pentominos[i];
            solutionString += this.pentomino2string(pentomino);
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