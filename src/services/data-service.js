import {
    inject,
    bindable
} from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';

export class DataService {

    constructor() {
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

}
