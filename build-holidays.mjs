import fs from "node:fs/promises";

const YEARS = [1404, 1405];

const pad2 = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}/${pad2(m)}/${pad2(d)}`;

const jMonthLen = (m) => (m <= 6 ? 31 : m <= 11 ? 30 : 30); // اسفند: 30 رو تلاش می‌کنیم

async function mapLimit(items, limit, fn) {
    const out = [];
    const executing = new Set();
    for (const item of items) {
        const p = Promise.resolve().then(() => fn(item));
        out.push(p);
        executing.add(p);
        p.finally(() => executing.delete(p));
        if (executing.size >= limit) await Promise.race(executing);
    }
    return Promise.all(out);
}

async function fetchJson(url, tries = 3) {
    for (let i = 1; i <= tries; i++) {
        try {
            const res = await fetch(url, { headers: { accept: "application/json" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (i === tries) throw e;
            await new Promise((r) => setTimeout(r, 400 * i));
        }
    }
}

function normalizeEvents(data) {
    const events = Array.isArray(data?.events) ? data.events : [];

    // حذف تکراری‌ها: description + additional_description + is_holiday + is_religious
    const seen = new Set();
    const uniq = [];

    for (const e of events) {
        const description = (e?.description || "").trim();
        const additional_description = (e?.additional_description || "").trim();
        const is_holiday = !!e?.is_holiday;
        const is_religious = !!e?.is_religious;

        if (!description) continue;

        const k = `${description}||${additional_description}||${is_holiday}||${is_religious}`;
        if (seen.has(k)) continue;
        seen.add(k);

        uniq.push({ description, additional_description, is_holiday, is_religious });
    }

    return {
        is_holiday: !!data?.is_holiday,
        events: uniq
    };
}

async function buildYear(year) {
    const tasks = [];
    for (let m = 1; m <= 12; m++) {
        const len = jMonthLen(m);
        for (let d = 1; d <= len; d++) tasks.push({ year, m, d });
    }

    const out = {}; // dateKey -> {is_holiday, events:[...]}

    await mapLimit(tasks, 6, async ({ year, m, d }) => {
        const url = `https://holidayapi.ir/jalali/${year}/${m}/${d}`;

        try {
            const data = await fetchJson(url);

            // ✅ این بار همه روزها ذخیره می‌شن
            out[key(year, m, d)] = normalizeEvents(data);
        } catch (e) {
            // اسفند 30 اگر نبود (29 روزه)، ردش کن
            if (m === 12 && d === 30) return;
            console.error("Failed:", url, e?.message || e);
        }
    });

    return out;
}

async function main() {
    const result = {};
    for (const y of YEARS) {
        console.log("Building year:", y);
        result[String(y)] = await buildYear(y);
        console.log("Days saved:", Object.keys(result[String(y)]).length);
    }

    await fs.writeFile("days-events.json", JSON.stringify(result, null, 2), "utf8");
    console.log("Saved: days-events.json");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
