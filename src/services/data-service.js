import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { BoardService } from './board-service';
import { pentominos } from '../data/pentominos';
import { colors } from '../data/colors';
import { startSquare, startRectangle, startDozen, startBeam, startStick, startTwig } from '../data/start-positions';

@inject(BoardService)

export class DataService {

    constructor(boardService) {
        this.bs = boardService;
        this.client = new HttpClient();
        this.solutions = this.getSolutions();
        this.timeOutHandle = undefined;
    }

    deleteSolutions() {
        this.solutions[this.bs.boardType] = [];
        this.saveSolution();
    }

    getPentominos() {
        return Promise.resolve(pentominos);
    }

    getColors() {
        return Promise.resolve(colors);
    }

    getStartPosition() {
        let data;
        switch (this.bs.boardType) {
        case 'square':
            data = startSquare;
            break;
        case 'rectangle':
            data = startRectangle;
            break;
        case 'dozen':
            data = startDozen;
            break;
        case 'beam':
            data = startBeam;
            break;
        case 'stick':
            data = startStick;
            break;
        case 'twig':
            data = startTwig;
            break;
        default:
            data = [];
        }
        return Promise.resolve(data);
    }

    getSolutions() {
        let solutions;
        if (localStorage.getItem('pentominos2')) {
            solutions = JSON.parse(localStorage.getItem('pentominos2'));
        } else {
            solutions = {};
            let boardTypes = this.bs.boardTypes;
            for (let type in boardTypes) {
                if (boardTypes.hasOwnProperty(type)) {
                    solutions[type] = [];
                }
            }
        }
        return solutions;
    }

    sortSolutions(solutions) {
        let sortedSolutions = solutions;
        if (Array.isArray(solutions)) {
            sortedSolutions = solutions.sort((a, b) => {
                return a < b;
            });
        }
        return sortedSolutions;
    }

    saveSolution(solutionString) {
        if (solutionString) {
            this.solutions[this.bs.boardType].push(solutionString);
        } else {
            this.saveToLocalStorage();
        }
        if (!this.timeOutHandle) {
            this.timeOutHandle = setTimeout(() => {
                this.saveToLocalStorage();
            }, 5000);
        }
    }

    saveToLocalStorage() {
        this.solutions[this.bs.boardType] = this.sortSolutions(this.solutions[this.bs.boardType]);
        localStorage.setItem('pentominos2', JSON.stringify(this.solutions));
        clearTimeout(this.timeOutHandle);
    }
}
