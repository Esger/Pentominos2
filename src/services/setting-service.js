import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from './board-service';

@inject(BoardService)
export class SettingService {

    constructor(boardService) {
        this.bs = boardService;
        this.opaqueBlocks = true;
        this.scale = 1;
        this.opaqueBlocks = false;
    }

    get partSize() {
        return this.bs.partSize;
    }

    getScale() {
        let screenWidth = document.querySelectorAll("html")[0].clientWidth;
        let boardWidth = document.querySelectorAll(".board")[0].clientWidth;
        let scale = Math.min(screenWidth / boardWidth, 1);
        scale = Math.floor(scale * 10) / 10;
        this.scale = scale;
        return {
            'transformOrigin': 'top',
            '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
            '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
            'transform': 'scale(' + scale + ', ' + scale + ')'
        };
    }

}
