import fs from "node:fs/promises";

// node build-holidays.mjs
const YEARS = [1405, 1406, 1407];

const pad2 = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}/${pad2(m)}/${pad2(d)}`;

const jMonthLen = (m) => (m <= 6 ? 31 : m <= 11 ? 30 : 30);

async function mapLimit(items, limit, fn) {
    const out = [];
    const executing = new Set();

    for (const item of items) {
        const p = Promise.resolve().then(() => fn(item));
        out.push(p);
        executing.add(p);

        p.finally(() => executing.delete(p));

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    return Promise.all(out);
}

async function fetchJson(url, tries = 3) {
    for (let i = 1; i <= tries; i++) {
        try {
            const res = await fetch(url, {
                headers: { accept: "application/json" }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            return await res.json();
        } catch (e) {
            if (i === tries) throw e;
            await new Promise((r) => setTimeout(r, 500 * i));
        }
    }
}

function normalizeEvents(data) {
    const day = data?.result || data?.data || data;

    const rawEvents =
        Array.isArray(day?.event) ? day.event :
            Array.isArray(day?.events) ? day.events :
                [];

    const seen = new Set();
    const events = [];

    for (const item of rawEvents) {
        const description =
            typeof item === "string"
                ? item.trim()
                : String(item?.description || item?.title || "").trim();

        if (!description) continue;

        const additional_description =
            typeof item === "object"
                ? String(item?.additional_description || "").trim()
                : "";

        const is_holiday =
            !!day?.holiday ||
            !!day?.is_holiday ||
            !!item?.is_holiday;

        const is_religious =
            typeof item === "object" ? !!item?.is_religious : false;

        const uniqKey = `${description}||${additional_description}||${is_holiday}||${is_religious}`;

        if (seen.has(uniqKey)) continue;
        seen.add(uniqKey);

        events.push({
            description,
            additional_description,
            is_holiday,
            is_religious
        });
    }

    return {
        is_holiday: !!day?.holiday || !!day?.is_holiday,
        events
    };
}

async function buildYear(year) {
    const tasks = [];

    for (let m = 1; m <= 12; m++) {
        const len = jMonthLen(m);

        for (let d = 1; d <= len; d++) {
            tasks.push({ year, m, d });
        }
    }

    const out = {};

    await mapLimit(tasks, 6, async ({ year, m, d }) => {
        const url = `https://pnldev.com/api/calender?year=${year}&month=${m}&day=${d}`;

        try {
            console.log("url:", url);

            const data = await fetchJson(url);

            out[key(year, m, d)] = normalizeEvents(data);
        } catch (e) {
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

    await fs.writeFile(
        "days-events1.json",
        JSON.stringify(result, null, 2),
        "utf8"
    );

    console.log("Saved: days-events1.json");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});