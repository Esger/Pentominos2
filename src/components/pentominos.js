import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class PentominosCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
    }

    addEventListeners() {

    }

    attached() {
        this.addEventListeners();
    }

}
