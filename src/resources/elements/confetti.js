import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class ConfettiCustomElement {
    constructor(element, eventAggregator) {
        this.element = element;
        this.ea = eventAggregator;
        this.canvas = null;
        this.confettiInstance = null;
    }

    attached() {
        this.canvas = this.element.querySelector('#confetti-canvas');
        if (window.confetti) {
            this.confettiInstance = window.confetti.create(this.canvas, {
                resize: true,
                useWorker: true
            });
        }

        this.subscribe();
    }

    subscribe() {
        this.ea.subscribe('user-solution-found', () => {
            this.launchConfetti();
        });
    }

    launchConfetti() {
        if (!this.confettiInstance) return;

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            this.confettiInstance({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            this.confettiInstance({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }
}
