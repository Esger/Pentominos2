export class PentominoSvgValueConverter {
    toView(pentomino, face) {
        if (!pentomino || !pentomino.faces || (face === undefined && pentomino.face === undefined)) return null;

        const currentFace = face !== undefined ? face : pentomino.face;
        const cells = pentomino.faces[currentFace];
        const S = 40; // cell size
        const R = 6; // corner radius
        const pad = 0;

        const maxC = Math.max(...cells.map(c => c[0]));
        const maxR = Math.max(...cells.map(c => c[1]));
        const w = (maxC + 1) * S;
        const h = (maxR + 1) * S;

        const path = this.buildPath(cells, S, R);
        const cols = maxC + 1;
        const rows = maxR + 1;

        return {
            id: 'p' + pentomino.name,
            color: pentomino.color,
            path: path,
            cols: cols,
            rows: rows,
            width: w,
            height: h,
            // Pre-built responsive CSS for maximum reliability in bindings
            widthCss: `calc(${cols} * var(--part-size, 40px))`,
            heightCss: `calc(${rows} * var(--part-size, 40px))`,
            viewBox: `0 0 ${w} ${h}`,
            glowWidth: w,
            glowHeight: h,
            glowX: w * 0.28,
            glowY: h * 0.18,
            glowRX: Math.min(w, h) * 0.22,
            glowRY: Math.min(w, h) * 0.09,
            // Lighting position (Top-Left of piece, but moved slightly inside)
            lightX: S * 0.5,
            lightY: S * 0.5,
            lightZ: 20
        };
    }

    buildPath(cells, S, R) {
        const cellSet = new Set(cells.map(([c, r]) => `${c},${r}`));
        const has = (c, r) => cellSet.has(`${c},${r}`);

        // Collect outline segments (edges between filled and empty)
        const segments = [];
        for (const [c, r] of cells) {
            // top edge
            if (!has(c, r - 1)) segments.push([[c * S, r * S], [c * S + S, r * S]]);
            // bottom edge
            if (!has(c, r + 1)) segments.push([[c * S + S, (r + 1) * S], [c * S, (r + 1) * S]]);
            // left edge
            if (!has(c - 1, r)) segments.push([[c * S, (r + 1) * S], [c * S, r * S]]);
            // right edge
            if (!has(c + 1, r)) segments.push([[c * S + S, r * S], [c * S + S, (r + 1) * S]]);
        }

        if (segments.length === 0) return '';

        // Chain segments into a polygon
        const chain = [segments[0][0], segments[0][1]];
        const used = new Set([0]);
        while (true) {
            const last = chain[chain.length - 1];
            let found = false;
            for (let i = 0; i < segments.length; i++) {
                if (used.has(i)) continue;
                const [a, b] = segments[i];
                if (a[0] === last[0] && a[1] === last[1]) {
                    chain.push(b);
                    used.add(i);
                    found = true;
                    break;
                }
                if (b[0] === last[0] && b[1] === last[1]) {
                    chain.push(a);
                    used.add(i);
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }
        chain.pop(); // last = first

        // Build SVG path with rounded corners
        const n = chain.length;
        let d = '';
        for (let i = 0; i < n; i++) {
            const prev = chain[(i - 1 + n) % n];
            const curr = chain[i];
            const next = chain[(i + 1) % n];

            // direction vectors
            const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1];
            const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1];
            const len1 = Math.hypot(dx1, dy1), len2 = Math.hypot(dx2, dy2);
            const r = Math.min(R, len1 / 2, len2 / 2);

            // approach point (coming into corner)
            const ax = curr[0] - (dx1 / len1) * r;
            const ay = curr[1] - (dy1 / len1) * r;
            // leave point
            const lx = curr[0] + (dx2 / len2) * r;
            const ly = curr[1] + (dy2 / len2) * r;

            if (i === 0) {
                d += `M ${ax} ${ay} `;
            } else {
                d += `L ${ax} ${ay} `;
            }
            d += `Q ${curr[0]} ${curr[1]} ${lx} ${ly} `;
        }
        d += 'Z';
        return d;
    }
}
