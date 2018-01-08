export class PentoPosValueConverter {
    toView(css, config) {
        css = {
            left: config.x * config.partSize + 'px',
            top: config.y * config.partSize + 'px',
            backgroundColor: config.color
        };
        return css;
    }
}