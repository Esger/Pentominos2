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
        // Convert old solutions
        let convert = function (solutions) {
            let convertedSolutions = {};
            for (let boardType in solutions) {
                if (solutions.hasOwnProperty(boardType)) {
                    if (solutions[boardType].length) {
                        for (let i = 0; i < solutions[boardType].length; i++) {
                            solutions[boardType][i] = solutions[boardType][i].split('#');
                            solutions[boardType][i].shift();
                            for (let j = 0; j < solutions[boardType][i].length; j++) {
                                solutions[boardType][i][j] = solutions[boardType][i][j].split('');
                                solutions[boardType][i][j] = solutions[boardType][i][j].join('_')
                            }
                            solutions[boardType][i] = '#' + solutions[boardType][i].join('#');
                        }
                    }
                }
                convertedSolutions[boardType] = solutions[boardType];
            }
            return convertedSolutions;
        };

        let solutions;

        if (localStorage.getItem("pentominos2")) {
            solutions = JSON.parse(localStorage.getItem("pentominos2"));
        } else {
            if (localStorage.getItem("pentominos")) {
                solutions = JSON.parse(localStorage.getItem("pentominos"));
                solutions = convert(solutions);
                localStorage.setItem("pentominos2", JSON.stringify(solutions));
                localStorage.removeItem("pentominos");
            } else {
                solutions = {};
                let boardTypes = this.bs.boardTypes;
                for (let type in boardTypes) {
                    if (boardTypes.hasOwnProperty(type)) {
                        // if (!solutions.hasOwnProperty(type)) {
                        solutions[type] = [];
                        // }
                    }
                }
            }
        }
        return solutions;
    }

    saveSolution(solutionString) {
        let solutions = this.getSolutions(this.bs.boardTypes);
        solutions[this.bs.boardType].push(solutionString);
        localStorage.setItem("pentominos2", JSON.stringify(solutions));
        // console.table(solutionString);
    }

}
