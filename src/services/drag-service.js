import {
    inject,
    bindable
} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { BindingSignaler } from 'aurelia-templating-resources';
import { SettingService } from './setting-service';
import { PentominoService } from './pentomino-service';
import { PermutationService } from './permutation-service';

@inject(BindingSignaler, EventAggregator, SettingService, PentominoService, PermutationService)

export class DragService {

    constructor(bindingSignaler, eventAggregator, settingService, pentominoService, permutationService) {
        this.bnds = bindingSignaler;
        this.ea = eventAggregator;
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
            this.ps.setActivePentomino(pentomino, partIndex);
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
        if (this.ps.getActivePentomino()) {
            this.x = clientPos.x - this.startX;
            this.y = clientPos.y - this.startY;
            this.container.style.left = this.x + 'px';
            this.container.style.top = this.y + 'px';
        }
    }

    stopDrag(event) {
        this.dragEndPos.x = this.x;
        this.dragEndPos.y = this.y;
        let pentomino = this.ps.getActivePentomino();
        if (pentomino) {
            this.alignToGrid();
            if (!this.isDragged()) {
                if (((pentomino.type < 4) &&
                    (pentomino.activePart < 3)) ||
                    ((pentomino.type == 4) && (pentomino.activePart < 1))) {
                    this.ps.adjustPosition();
                    this.prms.flipRotate(pentomino);
                    this.ea.publish('move', 1);
                }
            } else {
                this.ea.publish('move', 1);
            }
            this.ps.registerPiece(pentomino, 1);
            this.ps.isSolved();
        }
        this.releasePentomino();
    }

    releasePentomino() {
        if (this.container) {
            this.container.style.zIndex = '';
            this.container = null;
        }
        this.ps.resetActivePentomino();
    }

    alignToGrid() {
        let newX = Math.round(this.x / this.ss.partSize);
        let newY = Math.round(this.y / this.ss.partSize);
        this.ps.setActivePentominoPosition(newX, newY);
        this.container.style.left = newX * this.ss.partSize + 'px';
        this.container.style.top = newY * this.ss.partSize + 'px';
    }

    isDragged() {
        return ((Math.abs(this.dragEndPos.x - this.dragStartPos.x) > 19) || (Math.abs(this.dragEndPos.y - this.dragStartPos.y) > 19));
    }
}
