export function isEnglish(key) {
    return key.match(/[a-z]/i);
}

export function formatNumber(params) {
    var floor = Math.floor(params.value);
    if (!floor) return params.value;
    return floor.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function isNumber(value) {
    return Math.floor(value);
}

export function toPrice(value) {
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export const noImagePath = "../../../../../assets/images/noimage.png";
