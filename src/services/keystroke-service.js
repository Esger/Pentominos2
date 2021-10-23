import {
    inject
} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class KeystrokeService {
    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.acceptMoves = true;
        this.myKeypressCallback = this.keypressInput.bind(this);
        this._setSubscribers();
    }

    keysOff() {
        this.acceptMoves = false;
    }

    keysOn() {
        this.acceptMoves = true;
    }

    _setSubscribers() {
        document.addEventListener('keydown', this.myKeypressCallback, false);
        this.ea.subscribe('keysOff', response => {
            this.keysOff();
        });
        this.ea.subscribe('keysOn', response => {
            this.keysOn();
        });
    }

    // This function is called by the aliased method
    keypressInput(e) {
        let keycode = event.key; // also for cross-browser compatible
        (this.acceptMoves) && this.ea.publish('keyPressed', keycode);
    }
}
