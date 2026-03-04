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

        const boardElement = document.querySelector('.board');
        if (!boardElement) return;

        const rect = boardElement.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Points within the board (relative to the viewport)
        const points = [
            { x: (rect.left + rect.width * 0.25) / vw, y: (rect.top + rect.height * 0.25) / vh },
            { x: (rect.left + rect.width * 0.75) / vw, y: (rect.top + rect.height * 0.25) / vh },
            { x: (rect.left + rect.width * 0.25) / vw, y: (rect.top + rect.height * 0.75) / vh },
            { x: (rect.left + rect.width * 0.75) / vw, y: (rect.top + rect.height * 0.75) / vh },
            { x: (rect.left + rect.width * 0.5) / vw, y: (rect.top + rect.height * 0.5) / vh }
        ];

        const defaults = {
            zIndex: -1,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
            scalar: 1.2,
            gravity: 0.35, // Even slower motion
            ticks: 600,
            decay: 0.96,
            startVelocity: 20,
            spread: 90
        };

        // Launch a slightly randomized burst from each point
        points.forEach((point, index) => {
            setTimeout(() => {
                this.confettiInstance({
                    ...defaults,
                    origin: point,
                    particleCount: 40,
                    startVelocity: 15 + Math.random() * 15,
                    spread: 70 + Math.random() * 60
                });
            }, index * 150); // Staggered bursts for a more organic feel
        });
    }
}
