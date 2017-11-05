export class PartPosValueConverter {
    toView(css, config) {
        css = {
            left: config.x * config.partSize + 'px',
            top: config.y * config.partSize + 'px'
        }
        return css;
    }
}