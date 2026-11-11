// Checks of single features, each stated as what a reader should see. Run after changing the page:
//   node features.js [path-to-html]
// The books are invented. Outside requests are blocked.
const { chromium } = require("playwright");
const path = require("path");
const HTML = path.resolve(process.argv[2] || path.join(__dirname, "..", "shelfprint.html"));

const csv = rows => rows.map(r => r.map(v => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(",")).join("\n");
const HEAD = ["Title", "Author", "Status", "Start date", "End date", "Genre", "Rating", "Series", "Series #", "Audience", "Form", "Format", "Page count", "Illustrator / artist"];
// [title, author, start, end, series, #, audience, form, format, pages]
const book = (t, a, start, end, series, n, audience, form, format, pages) => [t, a, "Finished", start, end, "Fiction", 4, series, n, audience, form, format, pages, ""];
const ROWS = [
  book("The Long Winter Road", "Hale, Ann", "2025-01-01", "2025-01-12", "Roads", 1, "Adult", "Prose", "Print", 400),
  book("The Short Summer Road", "Hale, Ann", "2025-01-13", "2025-01-25", "Roads", 2, "Adult", "Prose", "Print", 350),
  book("Moon Courier 1", "Sato, Ren", "2025-01-26", "2025-01-27", "Moon Courier", 1, "Seinen", "Manga", "Print", 190),
  book("Moon Courier 2", "Sato, Ren", "2025-01-27", "2025-01-28", "Moon Courier", 2, "Seinen", "Manga", "Print", 200),
  book("Moon Courier 3", "Sato, Ren", "2025-02-01", "2025-02-02", "Moon Courier", 3, "Seinen", "manga", "Ebook", 210),
  book("A Quiet Field", "Okoro, Bea", "2025-02-03", "2025-02-20", "", "", "Adult", "Prose", "Print", 300),
  book("Paper Harbor", "Lind, Mo", "2025-03-01", "2025-03-03", "", "", "Adult", "Graphic Novel", "Print", 240),
  book("Tower Nine 1", "Kim, Jae", "2025-03-04", "2025-03-05", "", "", "", "Manhwa", "Ebook", 180),
  book("Verses for Rain", "Poe, Tess", "2025-03-06", "2025-03-09", "", "", "Adult", "Verse", "Print", 90),
  book("Moon Courier 4", "Sato, Ren", "2025-04-01", "2025-04-02", "Moon Courier", 4, "Seinen", "Manga", "Print", 200),
  book("Moon Courier 5", "Sato, Ren", "2025-04-03", "2025-04-04", "Moon Courier", 5, "Seinen", "Manga", "Print", 200),
  book("Ink Days", "Roe, Sam", "2025-05-01", "2025-05-02", "", "", "Adult", "Comic books", "Print", 120),
  book("Scroll Down", "Park, Min", "2025-05-03", "2025-05-04", "", "", "Young adult", "Webtoons", "Ebook", 150),
  book("Plain Prose", "Hale, Ann", "2025-05-05", "2025-05-15", "", "", "Adult", "Prose", "Print", 280)];
const MIXED = csv([HEAD, ...ROWS]);
const EDGES = csv([HEAD,
  book("Drawn Life", "Bell, Ali", "2025-01-01", "2025-01-02", "", "", "", "Graphic memoir", "Print", 200),
  book("Drawn Facts", "Bell, Ali", "2025-01-03", "2025-01-04", "", "", "", "Graphic non-fiction", "Print", 150),
  book("Drawn Story", "Bell, Ali", "2025-01-05", "2025-01-06", "", "", "", "Graphic novel", "Print", 180),
  book("Drawn Life 2", "Bell, Ali", "2025-02-01", "2025-02-02", "", "", "", "Graphic memoirs", "Print", 200),
  book("Drawn Life 3", "Bell, Ali", "2025-02-03", "2025-02-04", "", "", "", "graphic memoir", "Print", 210),
  book("Gap Saga 1", "Sato, Ren", "2025-03-01", "2025-03-02", "Gap Saga", 1, "", "Mangas", "Print", 190),
  book("Gap Saga 3", "Sato, Ren", "2025-03-03", "2025-03-04", "Gap Saga", 3, "", "Manga", "Print", 190),
  book("Other 1", "Kim, Jae", "2025-03-05", "2025-03-06", "", "", "", "Manhwas", "Print", 190),
  book("Roads 1", "Hale, Ann", "2025-03-07", "2025-03-20", "Roads", 1, "", "Prose", "Print", 300),
  book("Gap Saga 5", "Sato, Ren", "2025-04-01", "2025-04-02", "Gap Saga", 5, "", "Manga", "Print", 190),
  book("Roads 3", "Hale, Ann", "2025-05-01", "2025-05-12", "Roads", 3, "", "Prose", "Print", 320),
  book("No Form Given", "Hale, Ann", "2025-05-13", "2025-05-20", "", "", "", "", "Print", 250),
  book("Stapled Thing", "Roe, Sam", "2025-05-21", "2025-05-22", "", "", "", "Zine", "Print", 30),
  book("Gap Saga 6", "Sato, Ren", "2025-06-01", "2025-06-02", "Gap Saga", 6, "", "Manga", "Print", 190),
  book("Extra 1", "Sato, Ren", "2025-06-03", "2025-06-04", "", "", "", "Comics", "Print", 100),
  book("Extra 2", "Sato, Ren", "2025-06-05", "2025-06-06", "", "", "", "Webtoon", "Print", 100)]);
// the same kind of log from a reader who doesn't record Form or Audience
const NO_FORM = csv([HEAD, ...ROWS.slice(0, 6)].map(r => r.filter((_, i) => i !== 9 && i !== 10)));

let failed = 0;
const check = (what, ok, got) => { console.log(`${ok ? "  ok  " : "  FAIL"}  ${what}${ok ? "" : `\n          got: ${got}`}`); if (!ok) failed++; };

(async () => {
  const browser = await chromium.launch();
  const open = async text => {
    const p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
    p.on("pageerror", e => check("no errors on the page", false, e.message));
    await p.route(/^https?:\/\//, r => r.abort());
    await p.goto("file://" + HTML);
    await p.setInputFiles("#file", { name: "log.csv", mimeType: "text/csv", buffer: Buffer.from(text) });
    await p.waitForTimeout(700);
    return p;
  };
  const tiles = p => p.$$eval(".tiles .tile", ts => ts.map(t => ({ v: t.querySelector(".v").textContent, l: t.querySelector(".l").textContent, n: t.querySelector(".n").innerText.replace(/\n/g, " | ") })));
  const tile = async (p, label) => (await tiles(p)).find(t => t.l === label);
  const month = async (p, m) => { await p.evaluate(m => (location.hash = m), m); await p.waitForTimeout(400); };
  const cards = p => p.$$eval("#main .card h3", hs => hs.map(h => h.textContent));
  const show = t => JSON.stringify(t);
  const filterNote = p => p.$$eval(".filterbar", bars => bars.map(b => b.innerText).find(t => /Clear filter/.test(t)) || "");

  console.log("Manga and comics: a log with prose, manga, a graphic novel, manhwa, comics, and a webtoon");
  let p = await open(MIXED);
  let t = await tile(p, "manga and comics");
  check("the year has a tile counting them all", t && t.v === "9", show(await tiles(p)));
  check("its note breaks the count down by form", t && t.n === "5 manga · 1 comic · 1 graphic novel · 1 manhwa · 1 webtoon", show(t));
  check("books finished still counts every book", (await tiles(p))[0].v === "14", show((await tiles(p))[0]));
  t = await tile(p, "pages read");
  check("pages read is still the full total", t && t.v === "3,110", show(t));
  check("its note says how many pages were manga and comics", t && t.n === "across 14 books in print or ebook · 1,690 in manga and comics", show(t));
  t = await tile(p, "days per book (median)");
  check("pace compares manga and comics with other books", t && /\| manga and comics: 1 · other books: 11$/.test(t.n), show(t));
  check("a Form chart and an Audience chart are shown", (await cards(p)).includes("Form") && (await cards(p)).includes("Audience"), show(await cards(p)));
  const series = await p.$$eval("#main ul.list li", ls => ls.map(l => l.innerText.replace(/\s+/g, " ")));
  check("a manga series is counted in volumes", series.some(s => /^Moon Courier · Ren Sato vols\. 1–5 /.test(s)), show(series));
  check("a prose series is still counted in books", series.some(s => /^Roads · Ann Hale books 1–2 /.test(s)), show(series));
  await p.evaluate(() => [...document.querySelectorAll("svg .hit.click")].find(h => /Filter: Manga/.test(h.getAttribute("aria-label") || "")).dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await p.waitForTimeout(400);
  check("clicking Manga in the Form chart filters the page", /form Manga/.test(await filterNote(p)) && (await tiles(p))[0].v === "4", (await filterNote(p)) + show((await tiles(p))[0]));
  await p.evaluate(() => [...document.querySelectorAll(".filterbar .btn")].find(b => b.textContent === "Clear filter").click());

  await month(p, "2025-jan");
  t = await tile(p, "manga");
  check("a month with only manga among them says “manga”", t && t.v === "2" && t.n === "of 4 books finished", show(await tiles(p)));
  t = await tile(p, "pages read");
  check("that month's pages note names manga", t && / · 390 in manga$/.test(t.n), show(t));
  await month(p, "2025-mar");
  t = await tile(p, "manga and comics");
  check("a month with a graphic novel and manhwa says “manga and comics”", t && t.v === "2" && t.n === "1 graphic novel · 1 manhwa", show(await tiles(p)));
  await month(p, "2025-apr");
  check("a month of nothing but manga has no separate tile", !(await tiles(p)).some(x => /manga|comics/.test(x.l)), show(await tiles(p)));
  check("but books finished says they were all manga", (await tiles(p))[0].n === "all manga · 0 rated 4.5 or higher", show((await tiles(p))[0]));
  check("and so does its pages note", (await tile(p, "pages read")).n === "across 2 books in print or ebook · all in manga", show(await tile(p, "pages read")));
  await month(p, "2025-may");
  t = await tile(p, "comics and graphic novels");
  check("“Comic books” and “Webtoons” are recognized", t && t.v === "2" && t.n === "1 comic · 1 webtoon", show(await tiles(p)));
  await month(p, "2025-feb");
  t = await tile(p, "manga");
  check("one volume reads “1 manga”, and lower-case “manga” in the sheet counts", t && t.v === "1", show(await tiles(p)));
  await p.evaluate(() => document.querySelector("button.book").click());
  await p.waitForTimeout(300);
  const dl = await p.$eval("#bookm-body", e => e.innerText);
  check("a book's details show its Form and Audience", /Form\s+(Prose|manga)/i.test(dl) && /Audience\s+(Adult|Seinen)/.test(dl), dl.slice(0, 300));
  await p.context().close();

  console.log("\nNames, gaps, and blanks");
  p = await open(EDGES);
  await month(p, "2025-jan");
  t = await tile(p, "comics and graphic novels");
  check("a graphic memoir and graphic non-fiction keep their own names", t && t.n === "1 graphic memoir · 1 graphic nonfiction · 1 graphic novel", show(await tiles(p)));
  await month(p, "2025-feb");
  check("a month of only graphic memoirs says so, without an extra tile", (await tiles(p))[0].n.startsWith("all graphic memoirs") && !(await tile(p, "graphic memoirs")), show(await tiles(p)));
  check("its pages note names them too", /· all in graphic memoirs$/.test((await tile(p, "pages read")).n), show(await tile(p, "pages read")));
  await month(p, "2025-mar");
  t = await tile(p, "manga and comics");
  check("“Mangas” and “Manhwas” are recognized", t && t.n === "2 manga · 1 manhwa", show(await tiles(p)));
  await month(p, "2025-apr");
  check("a month with one manga volume and nothing else says “manga”", (await tiles(p))[0].n.startsWith("manga"), show((await tiles(p))[0]));
  await month(p, "2025-may");
  check("a prose-only month has no manga tiles or notes", !/manga|comics|graphic/i.test(show(await tiles(p))), show(await tiles(p)));
  await month(p, "2025-year");
  const gaps = await p.$$eval("#main ul.list li", ls => ls.map(l => l.innerText.replace(/\s+/g, " ")));
  check("skipped volumes are shown as gaps, not a range", gaps.some(s => /^Gap Saga · Ren Sato vols\. 1, 3, 5–6 /.test(s)), show(gaps));
  check("a prose series with a gap is listed the same way", gaps.some(s => /^Roads · Ann Hale books 1, 3 /.test(s)), show(gaps));
  const formCard = await p.$$eval("#main .card", cs => cs.filter(c => c.querySelector("h3")?.textContent === "Form").map(c => c.innerText.replace(/\s+/g, " "))[0]);
  check("a book with no Form is “not recorded”, not counted as prose", /Prose 2\b/.test(formCard) && /1 not recorded\./.test(formCard), formCard);
  t = await tile(p, "manga and comics");
  check("an unrecognized Form (a zine) isn't counted as manga or comics", t.v === "12" && !/zine/i.test(t.n) && (await tiles(p))[0].v === "16", show(t));
  await p.context().close();

  console.log("\nA log that doesn't record Form or Audience");
  p = await open(NO_FORM);
  const all = await p.$eval("#main", e => e.innerText);
  check("nothing about manga or comics appears", !/manga|comics|graphic novel|vols?\./i.test(all), all.match(/.{0,40}(manga|comics|graphic novel|vols?\.).{0,40}/i)?.[0]);
  check("no Form or Audience chart is shown", !(await cards(p)).some(h => h === "Form" || h === "Audience"), show(await cards(p)));
  check("the pages note is the usual one", (await tile(p, "pages read"))?.n === "across 6 books in print or ebook", show(await tile(p, "pages read")));
  await p.context().close();

  console.log("\nThe sample books");
  p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await p.route(/^https?:\/\//, r => r.abort());
  await p.goto("file://" + HTML);
  await p.click("#try-sample");
  await p.waitForTimeout(700);
  check("nothing about manga or comics appears", !/manga|comics|vols?\./i.test(await p.$eval("#main", e => e.innerText)), "");

  await browser.close();
  console.log(failed ? `\n${failed} failed.` : "\nAll passed.");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
