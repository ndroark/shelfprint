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

  // ---------- images (1.2.0) ----------
  const shareReady = async p => { await p.waitForTimeout(150); await p.waitForFunction(() => !document.querySelector("#share-dl").disabled, null, { timeout: 15000 }); await p.waitForTimeout(100); };
  const shareCanvas = p => p.$eval("#share-canvas", c => c.toDataURL("image/png"));
  const openMonthShare = async p => { await p.click("#share-open"); await shareReady(p); };
  const closeShare = async p => { await p.click("#share [data-close]"); await p.waitForTimeout(250); };
  const comicsBox = p => p.evaluate(() => { const l = document.querySelector("#s-comics-f"); return l ? { text: l.textContent, on: l.querySelector("input").checked, shown: !l.closest("[hidden]") } : null; });
  const shareStatus = p => p.$eval("#share-status", e => e.textContent);

  console.log("\nThe month image, with manga and comics");
  p = await open(MIXED);
  await month(p, "2025-jan");
  await openMonthShare(p);
  let box = await comicsBox(p);
  check("a month with manga offers “Include 2 manga”, ticked", box && box.text === "Include 2 manga" && box.on && box.shown, show(box));
  const withManga = await shareCanvas(p);
  await p.$eval("#s-comics", i => i.click()); await shareReady(p);
  check("unticking it changes the image", (await shareCanvas(p)) !== withManga, "same image");
  check("and the dialog says what was left off", /^2 manga are left off this image\./.test(await shareStatus(p)), await shareStatus(p));
  const withoutManga = await shareCanvas(p);
  await closeShare(p);
  check("the page itself still counts every book", (await tiles(p))[0].v === "4", show((await tiles(p))[0]));
  await openMonthShare(p);
  box = await comicsBox(p);
  check("the choice resets to ticked when the dialog opens again", box && box.on, show(box));
  await closeShare(p);
  await month(p, "2025-apr");
  await openMonthShare(p);
  check("a month that is all manga has no checkbox (leaving them out would leave nothing)", !(await comicsBox(p)), show(await comicsBox(p)));
  await closeShare(p);
  await month(p, "2025-may");
  await openMonthShare(p);
  box = await comicsBox(p);
  check("a mix with no manga says “comics and graphic novels”", box && box.text === "Include 2 comics and graphic novels", show(box));
  await p.$eval("#s-comics", i => i.click()); await shareReady(p);
  check("and its note names them the same way", /^2 comics and graphic novels are left off/.test(await shareStatus(p)), await shareStatus(p));
  await closeShare(p);
  await month(p, "2025-year");
  await p.click("#wrap-open"); await shareReady(p);
  await p.$eval('input[name=smode][value=single]', i => i.click()); await shareReady(p);
  box = await comicsBox(p);
  check("the year's one image offers it too", box && box.text === "Include 9 manga and comics" && box.shown, show(box));
  await p.$eval('input[name=smode][value=wrapped]', i => i.click()); await shareReady(p);
  check("My Year in Books (a set of images) doesn't show it", !(await comicsBox(p)).shown, show(await comicsBox(p)));
  await closeShare(p);
  await p.context().close();
  // the image with manga left off is the image of a log that never had them: its stats line counts only what's shown
  p = await open(csv([HEAD, ...ROWS.filter(r => !/^Moon Courier [12]$/.test(r[0]))]));
  await month(p, "2025-jan");
  await openMonthShare(p);
  check("with manga left off, the image is exactly that of the same month without them, stats line and all", (await shareCanvas(p)) === withoutManga, "the images differ");
  check("a month with no manga or comics has no checkbox", !(await comicsBox(p)), show(await comicsBox(p)));
  await p.context().close();
  p = await open(NO_FORM);
  await month(p, "2025-jan");
  await openMonthShare(p);
  check("a log without Form has no checkbox", !(await comicsBox(p)), show(await comicsBox(p)));
  await p.context().close();

  console.log("\nGenre shelves with Form values");
  const shelfPanel = p => p.$eval("#w-shelves", e => e.innerText);
  p = await open(MIXED);
  await p.evaluate(() => localStorage.setItem("wrapup:shelves:2025", JSON.stringify([{ id: "old1", values: [{ f: "genre", v: "Fiction" }], name: "" }])));
  await month(p, "2025-year");
  await p.click("#wrap-open"); await shareReady(p);
  check("a shelf saved before 1.2.0 still works", /Fiction\s*14 books/.test(await shelfPanel(p)), await shelfPanel(p));
  check("the editor's description mentions forms", /genres, sub-genres, or forms \(such as manga\)/.test(await shelfPanel(p)), await shelfPanel(p));
  await p.click("#w-add-shelf"); await p.waitForTimeout(150);
  const rows = await p.$$eval(".w-edit .w-pick-list > *", es => es.map(e => e.innerText.replace(/\s+/g, " ").trim()));
  const fi = rows.indexOf("Form");
  check("Form values are listed in a group headed “Form”, after the genres", fi > 0 && /· Genre/.test(rows[0]) && rows.slice(fi + 1).every(r => /· Form/.test(r)) && rows.slice(0, fi).every(r => !/· Form/.test(r)), show(rows));
  check("each Form value is labelled as a Form, with its count", rows.includes("Manga · Form 4") && rows.includes("Prose · Form 4"), show(rows));
  await p.$eval('.w-edit .w-pick-list input[value="form|Manga"]', i => i.click()); await p.waitForTimeout(150);
  await p.click("#w-ed-save"); await shareReady(p);
  check("a Form shelf matches the form whatever its capitals (“manga” too)", /Manga\s*5 books/.test(await shelfPanel(p)), await shelfPanel(p));
  const basis = await p.$eval("#w-basis", e => e.textContent);
  check("its image says how it was made: “Books whose Form is Manga”", /Books whose Form is Manga: 5 books in 2025\./.test(basis), basis.slice(0, 300));
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem("wrapup:shelves:2025")));
  check("the reader's categories aren't changed, and no shelf is made for them", saved.length === 2 && saved[0].id === "old1" && saved[1].values.length === 1 && saved[1].values[0].f === "form", show(saved));
  await p.context().close();
  p = await open(NO_FORM);
  await month(p, "2025-year");
  await p.click("#wrap-open"); await shareReady(p);
  await p.click("#w-add-shelf"); await p.waitForTimeout(150);
  const plain = await shelfPanel(p);
  check("a log without Form shows the shelf editor as before", /one or more genres or sub-genres:/.test(plain) && !/Form/.test(plain), plain);
  await p.context().close();

  console.log("\nBook cards: “Art by”");
  const artBook = (t, a, form, art) => [t, a, "Finished", "2025-06-01", "2025-06-02", "Fiction", 4, "", "", "", form, "Print", 200, art];
  const ART = csv([HEAD,
    artBook("Two Hands", "Sato, Ren", "Manga", "Kim, Jae"),
    artBook("One Hand", "Sato, Ren", "Manga", "Ren Sato"),
    artBook("Same Order", "Sato, Ren", "Manga", "SATO Ren"),
    artBook("Pair Work", "Lind, Mo; Roe, Sam", "Graphic novel", "Roe, Sam"),
    artBook("Pictures Too", "Hale, Ann", "Prose", "Bell, Ali"),
    artBook("Second Hands", "Sato, Ren", "Manga", "Jae Kim")]);
  const cardReady = async p => { await p.waitForTimeout(300); await p.waitForFunction(() => document.querySelector("#card-status").textContent !== "Making the card…", null, { timeout: 30000 }); await p.waitForTimeout(150); };
  const openBookCard = async (p, title) => {
    await p.evaluate(() => document.querySelector("#cardm:not([hidden]) [data-close]")?.click());
    await p.evaluate(() => document.querySelector("#bookm:not([hidden]) [data-close]")?.click());
    await p.waitForTimeout(200);
    await p.click(".finder-in"); await p.fill(".finder-in", ""); await p.keyboard.type(title); await p.waitForTimeout(300); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
    await p.click("#bookm-card"); await cardReady(p);
  };
  const artOpt = p => p.evaluate(() => { const i = document.querySelector("#c-inc-art"); return i ? { text: i.closest("label").textContent, on: i.checked } : null; });
  p = await open(ART);
  await openBookCard(p, "Two Hands");
  let a = await artOpt(p);
  check("a manga with a different artist offers “Art by: Jae Kim”, ticked", a && a.text === "Art by: Jae Kim" && a.on, show(a));
  const withArt = await p.$eval("#card-canvas", c => c.toDataURL());
  await p.$eval("#c-inc-art", i => i.click()); await cardReady(p);
  check("unticking it changes the card", (await p.$eval("#card-canvas", c => c.toDataURL())) !== withArt, "same card");
  await openBookCard(p, "Second Hands");
  a = await artOpt(p);
  check("the choice is remembered for the next card, like the other Include options", a && !a.on, show(a));
  await p.$eval("#c-inc-art", i => i.click()); await cardReady(p);
  await openBookCard(p, "One Hand");
  check("no “Art by” when the artist is the author (“Ren Sato” and “Sato, Ren”)", !(await artOpt(p)), show(await artOpt(p)));
  await openBookCard(p, "Same Order");
  check("names match in either order and any capitals (“SATO Ren”)", !(await artOpt(p)), show(await artOpt(p)));
  await openBookCard(p, "Pair Work");
  a = await artOpt(p);
  check("when one of two authors drew it, “Art by” names them", a && a.text === "Art by: Sam Roe", show(a));
  await openBookCard(p, "Pictures Too");
  check("a prose book with an illustrator has no “Art by” (manga and comics only)", !(await artOpt(p)), show(await artOpt(p)));
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
