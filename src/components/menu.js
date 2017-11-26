import {
    inject,
    bindable
} from 'aurelia-framework';
import { BindingSignaler } from 'aurelia-templating-resources';
import { BoardService } from '../services/board-service';
import { SolutionService } from '../services/solution-service';
import { PentominoService } from '../services/pentomino-service';
import { PermutationService } from '../services/permutation-service';
import { SolverService } from '../services/solver-service';

@inject(BindingSignaler, BoardService, SolutionService, PentominoService, PermutationService, SolverService)

export class MenuCustomElement {

    constructor(bindingSignaler, boardService, solutionService, pentominoService, permutationService, solverService) {
        this.bnds = bindingSignaler;
        this.bs = boardService;
        this.sls = solutionService;
        this.ps = pentominoService;
        this.prms = permutationService;
        this.slvs = solverService;
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
        this.bnds.signal('position-signal');
    }

    flipBoardYAxis() {
        this.prms.flipBoardYAxis(this.ps.pentominos);
        this.ps.registerPieces();
        this.settings.menuVisible = false;
        this.bnds.signal('position-signal');
    }

    showTheMenu() {
        this.settings.menuVisible = true;
        this.settings.submenuBoardsVisible = false;
    }

    mixBoard() {
        this.prms.mixBoard(this.ps.pentominos);
        this.ps.registerPieces();
        this.settings.menuVisible = false;
        this.bnds.signal('position-signal');
    }

    hideTheMenu() {
        this.settings.menuVisible = false;
    }

    showThisBoard(key) {
        // let threshold = 3;
        // if (this.sls.solutions) {
        //     switch (key) {
        //         case 'square':
        //             return true;
        //         case 'rectangle':
        //             return this.sls.solutions['square'].length > threshold;
        //         case 'beam':
        //             return this.sls.solutions['rectangle'].length > threshold;
        //         case 'stick':
        //             return this.sls.solutions['beam'].length > threshold;
        //         case 'twig':
        //             return this.sls.solutions['stick'].length > threshold;
        //         default:
        //             return false;
        //     }
        // }
        return true;
    }

    toggleSubmenuBoards() {
        this.settings.submenuBoardsVisible = !this.settings.submenuBoardsVisible;
        return false;
    }

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
    }

    getStartPosition(shape) {
        this.ps.getStartPosition(shape);
        this.ps.registerPieces();
        this.bs.unsetSolved();
        this.bs.unsetNewSolution();
        this.settings.submenuBoardsVisible = false;
        this.settings.menuVisible = false;
    }

    autoSolve() {
        this.settings.menuVisible = false;
        setTimeout(() => { this.slvs.autoSolve(); });
    }

}
