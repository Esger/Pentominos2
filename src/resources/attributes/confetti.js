import { p5 } from 'p5';
import { inject } from 'aurelia-framework';

@inject(Element)
export class ConfettiCustomAttribute {
    constructor(element) {
        this._element = element;
        this._element.classList.add('confetti-button');

        this.nouvelle = undefined;
        this.ancienne = undefined;
        this.pression = undefined;

        this.themeCouleur = [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
            '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
            '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
            '#FF5722'
        ];
    }

    attached() {
        this.setup();
    }

    detached() {
    }

    setup() {
        createCanvas(windowWidth, windowHeight);
        frameRate(60);
        this.ancienne = createVector(0, 0);
        this.nouvelle = createVector(0, 0);
        this.confettis = new SystemeDeParticules(500, createVector(width / 2, -20));
    }

    draw() {
        background(color("#111"));
        this.nouvelle.x = mouseX;
        this.nouvelle.y = mouseY;
        this.confettis.rendu();
        this.ancienne.x = this.nouvelle.x;
        this.ancienne.y = this.nouvelle.y;
    }

    windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        this.confettis.position = createVector(width / 2, -40);
    }

    mousePressed() {
        next = 0;
        this.pression = true;
    }

    mouseReleased() {
        this.pression = false;
        this.confettis.gravite.y = 0.1;
        this.confettis.gravite.x = 0;
    }

    confetti(event) {
    }
}

// @inject(P5)
export class ParticuleService {
    constructor(parent, p5) {
        this.parent = parent;
        this.gravite = parent.gravite;
        this.reinit();
        this.forme = round(random(0, 1));
        this.etape = 0;
        this.prise = 0;
        this.priseFacteur = random(-0.02, 0.02);
        this.multFacteur = random(0.01, 0.08);
        this.priseAngle = 0;
        this.priseVitesse = 0.05;
    }

    reinit() {

        this.position = this.parent.position.copy();
        this.position.y = random(-20, -100);
        this.position.x = random(0, width);
        this.velocite = createVector(random(-6, 6), random(-10, 2));
        this.friction = random(0.995, 0.98);
        this.taille = round(random(5, 15));
        this.moitie = this.taille / 2;
        this.couleur = color(random(themeCouleur));

    }

    dessiner() {

        this.etape = 0.5 + Math.sin(this.velocite.y * 20) * 0.5;

        this.prise = this.priseFacteur + Math.cos(this.priseAngle) * this.multFacteur;
        this.priseAngle += this.priseVitesse;
        translate(this.position.x, this.position.y);
        rotate(this.velocite.x * 2);
        scale(1, this.etape);
        noStroke();
        fill(this.couleur);

        if (this.forme === 0) {
            rect(-this.moitie, -this.moitie, this.taille, this.taille);
        } else {
            ellipse(0, 0, this.taille, this.taille);
        }

        resetMatrix();
    }

    integration() {
        this.velocite.add(this.gravite);
        this.velocite.x += this.prise;
        this.velocite.mult(this.friction);
        this.position.add(this.velocite);
        if (this.position.y > height) {
            this.reinit();
        }

        if (this.position.x < 0) {
            this.reinit();
        }
        if (this.position.x > width + 10) {
            this.reinit();
        }
    }

    rendu() {
        this.integration();
        this.dessiner();
    }
}

@inject(ParticuleService)
export class SystemeDeParticulesService {
    constructor(nombreMax, position, gravite) {
        this.position = position.copy();
        this.nombreMax = nombreMax;
        this.gravite = createVector(0, 0.1);
        this.friction = 0.98;
        // le tableau 
        this.particules = [];
        for (var i = 0; i < this.nombreMax; i++) {
            this.particules.push(new Particule(this));
        }
    }
    rendu({ pression, nouvelle, ancienne }) {
        if (pression) {
            const force = p5.Vector.sub(nouvelle, ancienne);
            this.gravite.x = force.x / 20;
            this.gravite.y = force.y / 20;
        }

        this.particules.forEach(particules => particules.rendu());
    }
}
