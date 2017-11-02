import {
    inject,
    bindable
} from 'aurelia-framework';

export class SettingService {

    constructor() {
        this.opaqueBlocks = true;
        this.showSolutions = false;
        this.scale = 1;
        this.partSize = 40;
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
    };

    setShowSolutions() {
        this.showSolutions = true;
    }

}
