import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { DataService } from './data-service';


@inject(EventAggregator, DataService)
export class PentominoService {

    constructor(eventAggregator, dataService) {
        this.ea = eventAggregator;
        this.ds = dataService;
        this.partSize = 40;
        this.boardType = 'square';
        this.boardTypes = {
            'square': {
                w: 8,
                h: 8,
                surface: 64
            },
            'rectangle': {
                w: 6,
                h: 10,
                surface: 60
            },
            'dozen': {
                w: 12,
                h: 5,
                surface: 60
            },
            'beam': {
                w: 15,
                h: 4,
                surface: 60
            },
            'stick': {
                w: 16,
                h: 4,
                surface: 64
            },
            'twig': {
                w: 20,
                h: 3,
                surface: 60
            }
        };
        this.pentominos = [];
        this.getPentominoData().then((response) => {
            this.pentominos = response;
        }).then(() => {
            this.getPentominoColors();
        }).then(() => {
            this.getStartPosition('square');
        }).then(() => {
            console.log(this.pentominos);
        });
    }

    getPentominoData() {
        return this.ds.getPentominos().then((response) => {
            return response;
        });
    }

    getPentominoColors() {
        // let self = this;
        return this.ds.getColors().then((response) => {
            for (let i = 0; i < this.pentominos.length; i++) {
                this.pentominos[i].color = response[i].color;
            }
        });
    }

    getStartPosition(shape) {
        return this.ds.getStartPosition(shape).then((response) => {
            for (let i = 0; i < this.pentominos.length; i++) {
                let pentomino = this.pentominos[i];
                pentomino.face = response[i].face;
                pentomino.position = response[i].position;
            }
        });
    }

    addEventListeners() {

    }

}
