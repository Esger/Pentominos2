import {
    inject,
    bindable
} from 'aurelia-framework';
import { SettingService } from './setting-service';
import { PentominoService } from './pentomino-service';
import { PermutationService } from './permutation-service';

@inject(SettingService, PentominoService, PermutationService)

export class DragService {

    constructor(settingService, pentominoService, permutationService) {
        this.ss = settingService;
        this.ps = pentominoService;
        this.prms = permutationService;
        this.dragStartPos = {};
        this.dragEndPos = {};
    }

    getClientPos(event) {
        let clientX = (event.touches) ? event.touches[0].clientX : event.clientX;
        let clientY = (event.touches) ? event.touches[0].clientY : event.clientY;
        return {
            x: clientX / this.ss.scale,
            y: clientY / this.ss.scale
        };
    }

    startDrag(pentomino, partIndex, event) {
        if (this.container == null) {
            let clientPos = this.getClientPos(event);
            this.ps.setCurrentPentomino(pentomino, partIndex);
            this.ps.registerPiece(pentomino, -1);
            this.container = event.target.offsetParent.offsetParent;
            this.container.style.zIndex = 100;
            this.startX = clientPos.x - this.container.offsetLeft;
            this.startY = clientPos.y - this.container.offsetTop;
            this.x = clientPos.x - this.startX;
            this.y = clientPos.y - this.startY;
            this.dragStartPos.x = this.x;
            this.dragStartPos.y = this.y;
        }
        return false;
    }

    doDrag(event) {
        let clientPos = this.getClientPos(event);
        if (this.ps.currentPentomino) {
            this.x = clientPos.x - this.startX;
            this.y = clientPos.y - this.startY;
            this.container.style.left = this.x + 'px';
            this.container.style.top = this.y + 'px';
        }
    }

    stopDrag(event) {
        this.dragEndPos.x = this.x;
        this.dragEndPos.y = this.y;
        if (this.ps.currentPentomino) {
            this.alignToGrid();
            if (!this.isDragged()) {
                if (((this.ps.currentPentomino.type < 4) &&
                    (this.ps.currentPentomino.activePart < 3)) ||
                    ((this.ps.currentPentomino.type == 4) && (this.ps.currentPentomino.activePart < 1))) {
                    this.ps.adjustPosition();
                    this.prms.flipRotate(this.ps.currentPentomino);
                }
            }
            this.ps.registerPiece(this.ps.currentPentomino, 1);
            this.ps.isSolved();
        }
        this.releasePentomino();
    }

    releasePentomino() {
        if (this.container) {
            this.container.style.zIndex = '';
            this.container = null;
        }
        this.ps.resetCurrentPentomino();
    }

    alignToGrid() {
        let newX = Math.round(this.x / this.ss.partSize);
        let newY = Math.round(this.y / this.ss.partSize);
        this.ps.alignCurrentPentomino(newX, newY);
        this.container.style.left = newX * this.ss.partSize + 'px';
        this.container.style.top = newY * this.ss.partSize + 'px';
    }

    isDragged() {
        return ((Math.abs(this.dragEndPos.x - this.dragStartPos.x) > 19) || (Math.abs(this.dragEndPos.y - this.dragStartPos.y) > 19));
    }
}
