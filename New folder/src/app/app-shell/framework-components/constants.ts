import * as moment from "jalali-moment";
declare var $: any;

export const noImagePath = "../../../../../assets/images/noimage.png";

export var sessions = [
    { id: 1, name: "بهار", miladi: 'Spring' },
    { id: 2, name: "تابستان", miladi: 'Summer' },
    { id: 3, name: "پاییز", miladi: 'Autumn' },
    { id: 4, name: "زمستان", miladi: 'Winter' }
];

export var months = [
    { id: 1, name: "فروردین", miladi: 'January' },
    { id: 2, name: "اردیبهشت", miladi: 'February' },
    { id: 3, name: "خرداد", miladi: 'March' },
    { id: 4, name: "تیر", miladi: 'April' },
    { id: 5, name: "مرداد", miladi: 'May' },
    { id: 6, name: "شهریور", miladi: 'June' },
    { id: 7, name: "مهر", miladi: 'July' },
    { id: 8, name: "آبان", miladi: 'August' },
    { id: 9, name: "آذر", miladi: 'September' },
    { id: 10, name: "دی", miladi: 'October' },
    { id: 11, name: "بهمن", miladi: 'November' },
    { id: 12, name: "اسفند", miladi: 'December' }
];

export var daysOfMonth = [
    { id: 1, name: "1" },
    { id: 2, name: "2" },
    { id: 3, name: "3" },
    { id: 4, name: "4" },
    { id: 5, name: "5" },
    { id: 6, name: "6" },
    { id: 7, name: "7" },
    { id: 8, name: "8" },
    { id: 9, name: "9" },
    { id: 10, name: "10" },
    { id: 11, name: "11" },
    { id: 12, name: "12" },
    { id: 13, name: "13" },
    { id: 14, name: "14" },
    { id: 15, name: "15" },
    { id: 16, name: "16" },
    { id: 17, name: "17" },
    { id: 18, name: "18" },
    { id: 19, name: "19" },
    { id: 20, name: "20" },
    { id: 21, name: "21" },
    { id: 22, name: "22" },
    { id: 23, name: "23" },
    { id: 24, name: "24" },
    { id: 25, name: "25" },
    { id: 26, name: "26" },
    { id: 27, name: "27" },
    { id: 28, name: "28" },
    { id: 29, name: "29" },
    { id: 30, name: "30" },
    { id: 31, name: "31" }
];

export var welcomeImages = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
    { id: '11' },
    { id: '12' },
    { id: '13' },
    { id: '14' },
    { id: '15' },
    { id: '16' },
    { id: '17' },
    { id: '18' },
    { id: '19' },
    { id: '20' },
    { id: '21' },
    { id: '22' },
    { id: '23' },
    { id: '24' },
    { id: '25' },
    { id: '26' },
    { id: '27' },
    { id: '28' },
    { id: '29' },
    { id: '30' }
];

export var daysOfWeek = [
    { id: 1, name: "شنبه" },
    { id: 2, name: "یکشنبه" },
    { id: 3, name: "دوشنبه" },
    { id: 4, name: "سه شنبه" },
    { id: 5, name: "چهار شنبه" },
    { id: 6, name: "پنج شنبه" },
    { id: 7, name: "جمعه" },
]

export function getCurrentMonth(calendarType = 1) {
    const date = new Date();
    const mom = moment(date);
    let month = mom.jMonth();

    if (calendarType == 2) {
        month = mom.month();
    }

    return months[month].id;
}

export var datePickerConfig = {
    drops: 'down',
    format: 'jYYYY/jMM/jDD',
    theme: "dp-material"
}

function p8(s = false) {
    var p = (Math.random().toString(16) + "000000000").substring(2, 8);
    return s ? "-" + p.substring(0, 4) + "-" + p.substring(4, 4) : p;
}

export function createGuid() {
    return p8() + p8(true) + p8(true) + p8();
}

export var HotkeysAllowedIn = ['INPUT', 'TEXTAREA', 'SELECT'];

export function createPreSelectedOption(selectId: string, dataName: string, dataId: string) {
    if (!dataName) return;

    let select = $(selectId);
    let option = new Option(dataName, dataId, true, true);
    select.append(option).trigger('change');
}

export function colorizeRow(index, prefix = 'item') {
    $(`[id^="${prefix}-"]`).each(function (_index, item) {
        $(item).removeClass("bg-soft-primary");
    });

    $(`#${prefix}-${index}`).addClass("bg-soft-primary");
}

export function getTodayDate() {
    return moment().locale('fa').format('jYYYY/jMM/jDD');
}

export function toMoney(value) {
    return new Intl.NumberFormat().format(value);
}