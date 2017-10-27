import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class MenuCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.settings = {
            menuVisible: false,
            submenuBoardsVisible: false,
            opaqueBlocks: false
        };
    }

    showTheMenu() {
        this.settings.menuVisible = true;
        this.settings.submenuBoardsVisible = false;
    };

    hideTheMenu() {
        this.settings.menuVisible = false;
    };

    showThisBoard(key) {
        let threshold = 3;
        if (this.solutions) {
            switch (key) {
                case 'square':
                    return true;
                case 'rectangle':
                    return this.solutions['square'].length > threshold;
                case 'beam':
                    return this.solutions['rectangle'].length > threshold;
                case 'stick':
                    return this.solutions['beam'].length > threshold;
                case 'twig':
                    return this.solutions['stick'].length > threshold;
                default:
                    return false;
            }
            console.log(this.board.boardTypes[key]);
        }
        return true;
    };

    toggleSubmenuBoards() {
        this.settings.submenuBoardsVisible = !this.settings.submenuBoardsVisible;
    };
    setOpaqueBlocks() {
        this.settings.opaqueBlocks = true;
    };
    setTransparentBlocks() {
        this.settings.opaqueBlocks = false;
    };
    screenIsLargeEnough() {
        let clw = document.querySelectorAll('html')[0].clientWidth;
        let clh = document.querySelectorAll('html')[0].clientHeight;
        return clw + clh > 1100;
    };

    addEventListeners() {

    }

    attached() {
        this.addEventListeners();
    }

}
