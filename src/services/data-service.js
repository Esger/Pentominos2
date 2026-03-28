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
        this.userSolutions = this.getUserSolutions();
        this.timeOutHandle = undefined;
    }

    deleteSolutions() {
        this.solutions[this.bs.boardType] = [...this.userSolutions[this.bs.boardType]];
        this.saveSolution();
    }

    getPentominos() {
        // Todo: kan synchroon, zonder promise
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

    getUserSolutions() {
        let userSolutions;
        if (localStorage.getItem('pentominos2_user')) {
            userSolutions = JSON.parse(localStorage.getItem('pentominos2_user'));
        } else {
            userSolutions = {};
            let boardTypes = this.bs.boardTypes;
            for (let type in boardTypes) {
                if (boardTypes.hasOwnProperty(type)) {
                    userSolutions[type] = [];
                }
            }
        }
        return userSolutions;
    }

    addUserSolution(solutionString) {
        if (!this.userSolutions[this.bs.boardType].includes(solutionString)) {
            this.userSolutions[this.bs.boardType].push(solutionString);
            this.saveToLocalStorage();
        }
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
        localStorage.setItem('pentominos2', JSON.stringify(this.solutions));
        localStorage.setItem('pentominos2_user', JSON.stringify(this.userSolutions));
        clearTimeout(this.timeOutHandle);
        this.timeOutHandle = undefined;
    }
}
