export class PentoFaceValueConverter {
    toView(array, config) {
        array = config.faces[config.face];
        return array;
    }
}