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
    }

    getPentominos() {
        let fileName = './src/data/pentominos.json';
        return this.client.get(fileName)
            .then((data) => {
                let response = JSON.parse(data.response);
                return response;
            });
    }

    getColors() {
        let fileName = './src/data/colors.json';
        return this.client.get(fileName)
            .then(data => {
                let response = JSON.parse(data.response);
                return response;
            });
    }

    getStartPosition(boardShape) {
        let fileName = './src/data/start-' + boardShape + '.json';
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

    saveSolution(solutionString) {
        let solutions = this.getSolutions(this.bs.boardTypes);
        solutions[this.bs.boardType].push(solutionString);
        localStorage.setItem("pentominos2", JSON.stringify(solutions));
    }

}
