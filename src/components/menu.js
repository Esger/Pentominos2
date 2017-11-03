import {
    inject,
    bindable
} from 'aurelia-framework';
import { BoardService } from '../services/board-service';
import { SolutionService } from '../services/solution-service';
import { PentominoService } from '../services/pentomino-service';
import { PermutationService } from '../services/permutation-service';

@inject(BoardService, SolutionService, PentominoService, PermutationService)

export class MenuCustomElement {

    constructor(boardService, solutionService, pentominoService, permutationService) {
        this.bs = boardService;
        this.sls = solutionService;
        this.ps = pentominoService;
        this.prms = permutationService;
        this.boardTypes = Object.keys(this.bs.boardTypes);
        this.settings = {
            menuVisible: false,
            submenuBoardsVisible: false
        };
    }

    rotateBoard() {
        this.prms.rotateBoard(this.ps.pentominos);
        this.ps.registerPieces();
        this.settings.menuVisible = false;
    }

    flipBoardYAxis() {
        this.prms.flipBoardYAxis(this.ps.pentominos);
        this.ps.registerPieces();
        this.settings.menuVisible = false;
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
        return false;
    };

    getBoardDimensions(boardType) {
        let text = ('' + this.bs.boardTypes[boardType].w + '&nbsp;&times;&nbsp;' + this.bs.boardTypes[boardType].h);
        return text;
    }

    getActiveBoardClass(boardType) {
        return (this.bs.boardType == boardType) ? 'active' : '';
    }

    screenIsLargeEnough() {
        let clw = document.querySelectorAll('html')[0].clientWidth;
        let clh = document.querySelectorAll('html')[0].clientHeight;
        return clw + clh > 1100;
    };

    getStartPosition(shape) {
        this.ps.getStartPosition(shape);
        this.settings.submenuBoardsVisible = false;
        this.settings.menuVisible = false;
    }

}
