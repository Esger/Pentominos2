export class PentoFaceValueConverter {
    toView(array, config) {
        array = config.pentomino.faces[config.pentomino.face];
        return array;
    }
}