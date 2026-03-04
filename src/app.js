import { inject } from 'aurelia-framework';
import { DragService } from './services/drag-service';
import { KeystrokeService } from './services/keystroke-service';

@inject(Element, DragService, KeystrokeService)

export class App {
    constructor(element, dragService, keystrokeService) {
        this.element = element;
        this.ds = dragService;
        this.ks = keystrokeService;
    }

    attached() {
        this._dragListener = (e) => this.ds.doDrag(e);
        this.element.addEventListener('touchmove', this._dragListener, { passive: false });

        // Safeguard for iOS: Prevent double-tap to zoom even if touch-action: none fails
        let lastTouchEnd = 0;
        this._safeguardListener = (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        };
        this.element.addEventListener('touchend', this._safeguardListener, { passive: false });
    }

    detached() {
        if (this._dragListener) {
            this.element.removeEventListener('touchmove', this._dragListener);
        }
        if (this._safeguardListener) {
            this.element.removeEventListener('touchend', this._safeguardListener);
        }
    }
}
