import fs from "node:fs/promises";

const YEARS = [1405, 1406, 1407];

const pad2 = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}/${pad2(m)}/${pad2(d)}`;

const jMonthLen = (m) => (m <= 6 ? 31 : m <= 11 ? 30 : 29);

// -------------------------
// Jalali months
// -------------------------
const jalaliMonthNames = [
    "",
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "اَمرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند"
];

const monthNamesEn = [
    "",
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// -------------------------
// Utils
// -------------------------
function cleanText(text) {
    return String(text || "")
        .replace(/[۰٠]/g, "0")
        .replace(/[۱١]/g, "1")
        .replace(/[۲٢]/g, "2")
        .replace(/[۳٣]/g, "3")
        .replace(/[۴٤]/g, "4")
        .replace(/[۵٥]/g, "5")
        .replace(/[۶٦]/g, "6")
        .replace(/[۷٧]/g, "7")
        .replace(/[۸٨]/g, "8")
        .replace(/[۹٩]/g, "9")
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function htmlToLines(html) {
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(div|li|p|tr|td|h1|h2|h3|h4|h5|h6)>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .split("\n")
        .map(cleanText)
        .filter(Boolean);
}

// -------------------------
// Fetch time.ir HTML
// -------------------------
async function fetchText(url, tries = 3) {
    for (let i = 1; i <= tries; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    "user-agent": "Mozilla/5.0",
                    accept: "text/html"
                }
            });

            if (!res.ok) throw new Error(res.status);

            return await res.text();
        } catch (e) {
            if (i === tries) throw e;
            await new Promise(r => setTimeout(r, 500 * i));
        }
    }
}

async function fetchTimeIrYearHtml(year) {
    const urls = [
        `https://www.time.ir/event-year?year=${year}`,
        `https://www.time.ir/event-year/${year}`,
        `https://www.time.ir/event-year`
    ];

    for (const url of urls) {
        const html = await fetchText(url);

        if (
            html.includes("مناسبت‌های ماه") &&
            html.includes("فروردین")
        ) {
            return html;
        }
    }

    throw new Error("time.ir not found");
}

// -------------------------
// Parsing
// -------------------------
function splitEventText(text) {
    const value = cleanText(text);
    const match = value.match(/^(.*?)\s*\[\s*(.*?)\s*\]\s*$/);

    if (!match) {
        return { description: value, date_text: "" };
    }

    return {
        description: cleanText(match[1]),
        date_text: cleanText(match[2])
    };
}

// فقط از خود time.ir تشخیص تعطیلی
function isHolidayFromTimeIr(line) {
    const t = cleanText(line);
    return (
        t.includes("تعطیل") ||
        t.includes("holiday") ||
        /رسمی/.test(t)
    );
}

function isReligiousEvent(desc, dateText) {
    const t = cleanText(`${desc} ${dateText}`);
    return /امام|حضرت|ولادت|شهادت|عید|غدیر|فطر|قربان|محرم|صفر|رمضان|ذوالحجه|عرفه|عاشورا|تاسوعا/.test(t);
}

// -------------------------
// Parse time.ir
// -------------------------
function parseTimeIrEvents(html, year) {
    const lines = htmlToLines(html);
    const out = {};

    const monthPattern = jalaliMonthNames
        .filter(Boolean)
        .map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");

    const regex = new RegExp(`^(\\d{1,2})\\s+(${monthPattern})\\s+(.+)$`);

    for (const line of lines) {
        const m = line.match(regex);
        if (!m) continue;

        const day = Number(m[1]);
        const monthName = cleanText(m[2]);
        const monthIndex = jalaliMonthNames.findIndex(x => cleanText(x) === monthName);

        if (!monthIndex || !day) continue;

        const parsed = splitEventText(m[3]);

        const k = key(year, monthIndex, day);

        if (!out[k]) out[k] = [];

        out[k].push({
            type: isReligiousEvent(parsed.description, parsed.date_text)
                ? "مذهبی"
                : "مناسبت",

            description: parsed.description,
            date_text: parsed.date_text || undefined,

            is_holiday: isHolidayFromTimeIr(line)
        });
    }

    return out;
}

// -------------------------
// Gregorian converter
// -------------------------
function div(a, b) {
    return ~~(a / b);
}

function jalaliToGregorian(jy, jm, jd) {
    jy += 1595;

    let days =
        -355668 +
        365 * jy +
        div(jy, 33) * 8 +
        div((jy % 33) + 3, 4) +
        jd +
        (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

    let gy = 400 * div(days, 146097);
    days %= 146097;

    if (days > 36524) {
        gy += 100 * div(--days, 36524);
        days %= 36524;
        if (days >= 365) days++;
    }

    gy += 4 * div(days, 1461);
    days %= 1461;

    if (days > 365) {
        gy += div(days - 1, 365);
        days = (days - 1) % 365;
    }

    let gd = days + 1;

    const salA = [
        0,
        31,
        (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ];

    let gm = 1;
    while (gm <= 12 && gd > salA[gm]) {
        gd -= salA[gm];
        gm++;
    }

    return { year: gy, month: gm, day: gd };
}

// -------------------------
// build year
// -------------------------
async function buildYear(year) {
    console.log("year:", year);

    const html = await fetchTimeIrYearHtml(year);
    const events = parseTimeIrEvents(html, year);

    const out = {};

    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= jMonthLen(m); d++) {
            const k = key(year, m, d);
            const g = jalaliToGregorian(year, m, d);

            const dayEvents = events[k] || [];

            out[k] = {
                solar_date: k,
                gregorian_date: `${g.year}-${pad2(g.month)}-${pad2(g.day)}`,
                gregorian_text: `${g.day} ${monthNamesEn[g.month]}`,

                is_holiday: dayEvents.some(e => e.is_holiday),

                events: dayEvents.map(({ is_holiday, ...e }) => e)
            };
        }
    }

    return out;
}

// -------------------------
async function main() {
    const result = {};

    for (const y of YEARS) {
        result[y] = await buildYear(y);
    }

    await fs.writeFile(
        "days-events1.json",
        JSON.stringify(result, null, 2),
        "utf8"
    );

    console.log("DONE");
}

main().catch(console.error);