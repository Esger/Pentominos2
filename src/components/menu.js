import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { BoardService } from '../services/board-service';
import { SettingService } from '../services/setting-service';
import { PentominoService } from '../services/pentomino-service';
import { PermutationService } from '../services/permutation-service';

@inject(EventAggregator, BoardService, SettingService, PentominoService, PermutationService)

export class MenuCustomElement {

    constructor(eventAggregator, boardService, settingService, pentominoService, permutationService) {
        this.ea = eventAggregator;
        this.bs = boardService;
        this.ss = settingService;
        this.ps = pentominoService;
        this.prms = permutationService;
        this.boardTypes = Object.keys(this.bs.boardTypes);
        this.settings = {
            menuVisible: false,
            submenuBoardsVisible: false,
        };
    }

    rotateBoard() {
        this.prms.rotateBoard(this.ps.pentominos);
    }

    flipBoardYAxis() {
        this.prms.flipBoardYAxis(this.ps.pentominos);
    }

    showTheMenu() {
        this.settings.menuVisible = true;
        this.settings.submenuBoardsVisible = false;
    };

    mixBoard() {
        this.prms.mixBoard(this.ps.pentominos);
        this.ps.registerPieces();
        this.settings.menuVisible = false;
    }

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
