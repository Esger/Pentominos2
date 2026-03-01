import { inject } from 'aurelia-framework';
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
        this.lastZindex = 1;
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
        if (this._container == null) {
            let clientPos = this.getClientPos(event);
            this.ps.setActivePentomino(pentomino, partIndex);
            this.ps.registerPiece(pentomino, -1);
            this._container = event.target.offsetParent.offsetParent;
            this._container.style.zIndex = this.lastZindex++;
            this.startX = clientPos.x - this._container.offsetLeft;
            this.startY = clientPos.y - this._container.offsetTop;
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
            if (this._container) {
                this._container.style.left = this.x + 'px';
                this._container.style.top = this.y + 'px';
            }
        }
    }

    stopDrag(event) {
        const pentomino = this.ps.getActivePentomino();
        if (pentomino) {
            this.dragEndPos.x = this.x;
            this.dragEndPos.y = this.y;

            const isDragged = this.isDragged();

            if (isDragged) {
                // Definite move -> Snap to the nearest grid cell instantly
                this.alignToGrid();
                this.ea.publish('move', 1);
            } else {
                // Small movement or click
                // First, force an instant snap to the current model position 
                // to clear any manual dragging offset.
                this.alignToGrid();

                // Only rotate/flip if it was a very precise click (minimal movement)
                if (this.isClick()) {
                    this.prms.permute(pentomino);
                    this.ea.publish('move', 1);
                    // Re-snap because face/position likely changed after permutation
                    this.alignToGrid();
                } else {
                    // It was a tiny drag (< 19px), just snap it back.
                    this.ea.publish('move', 1);
                }
            }
            this.ps.registerPiece(pentomino, 1);
            this.ps.isSolved();
        }
        this.releasePentomino();
    }

    releasePentomino() {
        if (this._container) {
            this._container = null;
        }
        this.ps.resetActivePentomino();
    }

    alignToGrid() {
        let newX = Math.round(this.x / this.ss.partSize);
        let newY = Math.round(this.y / this.ss.partSize);
        this.ps.setActivePentominoPosition(newX, newY);
        if (this._container) {
            this._container.style.left = newX * this.ss.partSize + 'px';
            this._container.style.top = newY * this.ss.partSize + 'px';
        }
    }

    isDragged() {
        return ((Math.abs(this.dragEndPos.x - this.dragStartPos.x) > 19) || (Math.abs(this.dragEndPos.y - this.dragStartPos.y) > 19));
    }

    isClick() {
        return ((Math.abs(this.dragEndPos.x - this.dragStartPos.x) < 5) && (Math.abs(this.dragEndPos.y - this.dragStartPos.y) < 5));
    }
}
