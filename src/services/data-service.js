import {
    inject,
    bindable
} from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { BoardService } from './board-service';

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
        let fileName = './src/resources/data/pentominos.json';
        return this.client.get(fileName)
            .then((data) => {
                let response = JSON.parse(data.response);
                return response;
            });
    }

    getColors() {
        let fileName = './src/resources/data/colors.json';
        return this.client.get(fileName)
            .then(data => {
                let response = JSON.parse(data.response);
                return response;
            });
    }

    getStartPosition() {
        let fileName = './src/resources/data/start-' + this.bs.boardType + '.json';
        return this.client.get(fileName)
            .then(data => {
                let response = JSON.parse(data.response);
                return response;
            });
    }

    getSolutions() {
        let solutions;
        if (localStorage.getItem("pentominos2")) {
            solutions = JSON.parse(localStorage.getItem("pentominos2"));
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
        if (Array.isArray(solutions)) {
            return solutions.sort((a, b) => {
                return a < b;
            });
        } else {
            return solutions;
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
        this.solutions[this.bs.boardType] = this.sortSolutions(this.solutions[this.bs.boardType]);
        localStorage.setItem("pentominos2", JSON.stringify(this.solutions));
        clearTimeout(this.timeOutHandle);
    }
}
