import {
    inject,
    bindable
} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { BoardService } from './board-service';
import { PermutationService } from './permutation-service';
import { DataService } from './data-service';
import { SettingService } from './setting-service';

@inject(BoardService, PermutationService, DataService, SettingService, EventAggregator)

export class SolutionService {

    constructor(boardService, permutationService, dataService, settingService, eventAggregator) {
        this.bs = boardService;
        this.ds = dataService;
        this.ss = settingService;
        this.prms = permutationService;
        this.ea = eventAggregator;
        this._possibleSolutions = [];
        this.currentSolution = -1;
        this.getSolutions();
    }

    getSolutions() {
        this.solutions = this.ds.getSolutions();
    }

    setPossibleSolutions(onBoardPentominos) {
        let solutions = this.solutions[this.bs.boardType];

        // 1. Efficiently pre-process solutions into sets of parts for faster lookup
        // We only do this if the underlying solutions array changed or we haven't done it yet
        if (!this._solutionSets || this._solutionSets.source !== solutions) {
            this._solutionSets = solutions.map(s => new Set(s.substr(1).split('#')));
            this._solutionSets.source = solutions;
        }

        const rotations = 4;
        let flipRotatedOnboardStrings = [];

        // 2. Generate all 8 board orientations
        for (let flip = 0; flip < 2; flip++) {
            for (let rotation = 0; rotation < rotations; rotation++) {
                let onBoardStrings = onBoardPentominos.map(p => this.pentomino2string(p));
                flipRotatedOnboardStrings.push(onBoardStrings);
                this.prms.rotateBoard(onBoardPentominos);
            }
            this.prms.flipBoardYAxis(onBoardPentominos);
        }

        // 3. Match against pre-parsed sets (O(1) lookup instead of O(N) string search)
        this._possibleSolutions = solutions.filter((solution, idx) => {
            const solSet = this._solutionSets[idx];
            // Check if any of our 8 board orientations matches this solution's parts
            return flipRotatedOnboardStrings.some(onBoardStrings => {
                // All current pieces must be present in the solution
                return onBoardStrings.every(str => solSet.has(str));
            });
        });
    }

    getPossibleSolutionsCount() {
        return this._possibleSolutions.length;
    }

    deleteSolutions() {
        this.ds.deleteSolutions();
        this.getSolutions();
        this.currentSolution = this.solutions[this.bs.boardType].length > 0 ? 0 : -1;
        this.ea.publish('solution-processed');
    }

    saveSolution(pentominos, isUser = false) {
        if (pentominos) {
            let solutionResult = this.isNewSolution(pentominos);
            // A number indicates an existing solution
            // A string indicate a new solution
            if (!isNaN(solutionResult)) {
                // show this solution only if manually played, prevents slider jitter during auto-solve
                if (isUser) {
                    this.currentSolution = solutionResult;
                    this.ds.addUserSolution(this.solutions[this.bs.boardType][solutionResult]);
                    this.ea.publish('user-solution-found');
                }
                this.bs.unsetNewSolution();
            } else {
                this.solutions[this.bs.boardType].push(solutionResult);
                this.currentSolution = this.solutions[this.bs.boardType].length - 1;
                this.bs.setNewSolution();
                this.ds.saveSolution(solutionResult);
                if (isUser) {
                    this.ds.addUserSolution(solutionResult);
                    this.ea.publish('user-solution-found');
                }
            }
            this.ea.publish('solution-processed');
        } else {
            this.ds.saveSolution();
        }
    }

    findSolution(solutionString) {
        return this.solutions[this.bs.boardType].indexOf(solutionString);
    }

    isNewSolution(pentominos) {
        const rotations = 4;
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
