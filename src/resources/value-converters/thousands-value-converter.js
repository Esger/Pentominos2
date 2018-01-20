export class ThousandsValueConverter {
    toView(number) {
        return number.toLocaleString('nl');
    }
}