import { inject } from 'aurelia-framework';
import { BoardService } from 'services/board-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { SolutionService } from 'services/solution-service';
import { PentominoService } from 'services/pentomino-service';
import { PermutationService } from 'services/permutation-service';
import { SettingService } from 'services/setting-service';

@inject(Element, BoardService, EventAggregator, SolutionService, PentominoService, PermutationService, SettingService)

export class MenuCustomElement {

    constructor(element, boardService, eventAggregator, solutionService, pentominoService, permutationService, settingService) {
        this._element = element;
        this.bs = boardService;
        this.ea = eventAggregator;
        this.sls = solutionService;
        this.ps = pentominoService;
        this.prms = permutationService;
        this.ss = settingService;
        this.boardTypes = Object.keys(this.bs.boardTypes);
        this.settings = {
            menuDisabled: false,
            submenuBoardsVisible: false,
        };
        this.ea.subscribe('solving', response => {
            this.settings.menuDisabled = response;
        });
    }

    attached() {
        this._popover = this._element.querySelectorAll('[popover]')[0];
        this._popover.addEventListener('beforetoggle', event => {
            if (event.newState === 'open') {
                const rect = this._element.getBoundingClientRect();
                this._popover.style = '--left: ' + rect.left + 'px; --top: ' + rect.top + 'px;';
                this.settings.submenuBoardsVisible = false;
            }
        });
    }

    get disableBoardSwitch() {
        return (this.sls.solutions['square'].length < 2);
    }

    get menuDisabled() {
        return this.settings.menuDisabled;
    }

    get solverDisabled() {
        return (this.sls.solutions['square'].length < 2) || !this.workersSupported();
    }

    rotateBoard() {
        this.prms.rotateBoard(this.ps.pentominos);
        this.ps.registerPieces();
    }

    flipBoardYAxis() {
        this.prms.flipBoardYAxis(this.ps.pentominos);
        this.ps.registerPieces();
    }

    mixBoard() {
        this.prms.mixBoard(this.ps.pentominos);
        this.ps.registerPieces();
        this.ea.publish('move', 0);
    }

    showThisBoard(key) {
        let threshold = 3;
        if (this.sls.solutions) {
            switch (key) {
                case 'square':
                    return true;
                case 'rectangle':
                    return this.sls.solutions['square'].length > threshold;
                case 'beam':
                    return this.sls.solutions['rectangle'].length > threshold;
                case 'stick':
                    return this.sls.solutions['beam'].length > threshold;
                case 'twig':
                    return this.sls.solutions['stick'].length > threshold;
                default:
                    return false;
            }
        }
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

    setStartPosition(shape) {
        this.ea.publish('showSolvingPanel', false);
        this.ea.publish('move', 0);
        this.bs.setBoardType(shape);
        this.ps.getStartPosition();
        this.ps.registerPieces();
        this.bs.unsetSolved();
        this.bs.unsetNewSolution();
        this.settings.submenuBoardsVisible = false;
    }

    workersSupported() {
        if (window.Worker) {
            return true;
        }
        return false;
    }

    showSolvingPanel() {
        this.ea.publish('showSolvingPanel', true);
    }

}
