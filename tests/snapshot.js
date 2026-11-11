// Drives shelfprint.html through its features in a headless browser and records what it produces: page
// snapshots, every kind of generated image, downloads, clipboard text, and browser storage. Run it on two
// versions of the page and compare the results (compare.js does both). Outside services are replaced with
// stand-ins, the clock is fixed, and the page's version number is masked, so two runs of the same code match.
//   node snapshot.js <path-to-html> <outdir>
// To include a real reading log as well, set SHELFPRINT_OWN_CSV to the path of a Reading Log export.
const { chromium } = require("playwright");
const fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
const [, , HTML, OUT] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
const OWN_CSV = process.env.SHELFPRINT_OWN_CSV || '';
// a copy of the page with its version number masked, so a version bump alone changes nothing
const PAGE = path.join(OUT, '_page.html');
fs.writeFileSync(PAGE, fs.readFileSync(HTML, 'utf8').replace(/const VERSION\s*=\s*"[^"]*"/, 'const VERSION = "0.0.0"'));
const sha = b => crypto.createHash('sha1').update(b).digest('hex').slice(0, 16);
const R = {};
const rec = (name, data, ext = 'txt') => { const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data)); R[name] = sha(buf); fs.writeFileSync(path.join(OUT, name.replace(/[^\w.-]+/g, '_') + '.' + ext), buf); };

// a tiny valid PNG of a given colour, as a stand-in cover
function png(w, h, rgb) {
  const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = b => { let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = (rgb[0] + x) & 255; raw[o + 1] = (rgb[1] + y) & 255; raw[o + 2] = rgb[2]; }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const IMG = { a: png(200, 300, [40, 90, 160]), b: png(300, 300, [150, 60, 40]), c: png(240, 400, [30, 120, 90]) };

const LONG = 'This is a long review that goes on for a while; it has clauses, and sentences. ' + Array.from({ length: 40 }, (_, i) => `Sentence number ${i + 1} says something about the book — and then a little more: a detail, a turn, an afterthought.`).join(' ') + '\n\nA second paragraph begins here. It is shorter. “A quoted passage that runs long enough to count as a quotation inside the text,” someone said.';
const q = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
const CUSTOM = (() => {
  const head = ['Title', 'Author', 'Status', 'Start date', 'End date', 'Month read', 'Year read', 'New-to-me author?', 'Genre', 'Sub-genre(s)', 'Plot', 'Prose', 'Ideas', 'Matrix Average', 'Rating', 'Series', 'Series #', 'Publication year', 'Format', 'Page count', 'Audio length', 'Listening speed', 'Reread?', 'Source', 'How I found it', 'Recommended by', 'Publisher', 'Imprint', 'Original title', 'Original language', 'Language read', 'Author gender', 'Bipoc author?', 'Tags', 'Narrative perspective', 'Freeform thoughts', 'Translator', 'Narrator', 'Illustrator / artist', 'ISBN', 'Cover URL', 'Found cover', 'Record ID', 'Percent at DNF?'];
  const rows = [
    ['Alpha: A Subtitle', 'Writer, Ann', 'Finished', '2025-01-02', '2025-01-10', '', '', 'TRUE', 'Fantasy', 'Romantasy, Epic', 4, 5, 3.5, '', 4.5, 'Saga', 1, 2001, 'Print', 320, '', '', '', 'Library', 'Friend', 'Sam P.', 'Tor', 'Tordotcom', '', '', '', 'Female', 'TRUE', 'Dragons, Found family, War, Maps', 'First-person narration', 'Short and sweet.', '', '', 'Ill Ustrator', '', 'https://covers.test/a.png', '', 'R-1', ''],
    ['Beta', 'Writer, Ann', 'Finished', '2025-01-12', '2025-02-03', 'January', '', 'FALSE', 'Fantasy', 'Epic', 5, 5, 5, '', 5, 'Saga', 2, 2003, 'Audiobook', '', '10:30', '1.5', 'TRUE', 'Libby', 'Friend', '', 'Tor', '', '', '', '', 'Female', 'TRUE', 'Dragons, Found family, War', 'First-person narration', LONG, '', 'Nar Rator; Second Voice', '', '', 'https://blocked.test/b.png', 'https://covers.test/c.png', 'R-2', ''],
    ['Gamma', 'Otro, Luis', 'Finished', '', '2025-03-15', '', '2025', 'TRUE', 'Non-Fiction', 'Memoir', '', '', '', '', 4, '', '', 1999, 'Ebook', 210, '', '', '', 'Owned', 'Podcast', '', '', '', 'Gama', 'Spanish', 'English', 'Male', '', 'Memory, War', '', '“All of this is one quotation that the reader pasted in.”', 'T. Ranslator', '', '', '', 'https://blocked.test/b.png', '', '', ''],
    ['Delta', 'Solo', 'Finished', '', '', 'April', '2025', '', 'Fantasy', 'Romantasy', 3, 3, 3, '', 3, '', '', '', 'Print', 150, '', '', '', '', '', '', '', '', '', '', '', 'Nonbinary', '', 'Maps', '', '', '', '', '', '', '', 'https://covers.test/b.png', '', ''],
    ['Epsilon', 'Solo', 'Finished', '', '', 'May', '', '', 'Horror', '', '', '', '', '', 2.5, '', '', '', 'Print', 99, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Zeta', 'Pair, A; Pair, B', 'DNF', '', '2025-06-01', 'March', '25', '', 'Horror', 'Gothic', 2, 9, 2, '', '', '', '', '', 'Print', 400, '', '', '', '', '', '', '', '', '', '', '', '', '', 'War', '', 'Gave up.', '', '', '', '', '', '', 'R-1', 40],
    ['Eta', 'Late, Di', 'Finished', '2025-12-20', '2026-01-04', 'December', '', 'TRUE', 'Fantasy', 'Epic', 4, 4, 4.5, '', 4.25, '', '', 2020, 'Print', 500, '', '', '', 'Library', '', '', '', '', '', '', '', 'Female', '', 'Dragons, Maps', 'Multiple POVs', 'A “mixed” note with a quoted passage: “this part is long enough to be set in italics here,” and more.', '', '', '', '9780000000002', '', '', '', ''],
    ['Theta', 'Now, Rea', 'Reading', '2026-01-05', '', '', '', '', 'Fantasy', '', '', '', '', '', '', '', '', '', 'Print', 300, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'https://covers.test/a.png', '', '', ''],
    ['Iota', 'Otro, Luis', 'Finished', '2026-02-01', '2026-02-09', '', '2025', '', 'Non-Fiction', 'Essays', '', '', '', '', 4, '', '', '', 'Print', 180, '', '', '', '', '', '', '', '', '', '', '', 'Male', '', 'Memory', '', '', '', '', '', '', '', '', '', ''],
    ['Alpha: A Subtitle', 'Writer, Ann', 'Finished', '2025-07-01', '2025-07-09', '', '', '', 'Fantasy', 'Romantasy', 4, 4, 4, '', 4, 'Saga', 1, 2001, 'Ebook', 320, '', '', 'TRUE', '', '', '', '', '', '', '', '', 'Female', 'TRUE', 'Dragons', '', '', '', '', '', '', '', '', 'R-3', '']
  ];
  return ['Reading Log,,,', head.join(','), ...rows.map(r => r.map(q).join(','))].join('\n');
})();

(async () => {
  const browser = await chromium.launch();
  const errs = []; global.__errs = errs;
  async function ctx(viewport, opts = {}) {
    const c = await browser.newContext({ viewport, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true, hasTouch: !!opts.touch, isMobile: !!opts.touch });
    const p = await c.newPage();
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
    await p.clock.setFixedTime(new Date('2026-11-10T12:00:00'));
    await p.route(/^https?:\/\//, async r => {
      const u = new URL(r.request().url());
      const img = (b, cors) => r.fulfill({ status: 200, contentType: 'image/png', body: b, headers: cors ? { 'access-control-allow-origin': '*' } : {} });
      if (u.hostname === 'covers.test') return img(IMG[u.pathname.slice(1, 2)] || IMG.a, true);
      if (u.hostname === 'blocked.test') return u.searchParams.has('share') ? r.abort() : img(IMG.b, false);   // shows on the page, can't be copied into an image
      if (u.hostname === 'images.weserv.nl') return opts.proxy ? img(IMG.c, true) : r.abort();
      if (opts.lookup && u.hostname === 'openlibrary.org') { const t = u.searchParams.get('title') || ''; return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ docs: /epsilon|iota/i.test(t) ? [{ title: t, cover_i: 7 }] : [] }) }); }
      if (opts.lookup && u.hostname === 'covers.openlibrary.org') return /isbn/.test(u.pathname) ? r.fulfill({ status: 404, body: '' }) : img(IMG.c, true);
      if (opts.lookup && u.hostname === 'www.googleapis.com') return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ items: [] }) });
      return r.abort();
    });
    await p.goto('file://' + path.resolve(PAGE));
    return p;
  }
  const settle = (p, ms = 350) => p.waitForTimeout(ms);
  const clk = (p, sel, i = 0) => p.evaluate(([s, i]) => { const e = document.querySelectorAll(s)[i]; if (!e) throw new Error('no ' + s); e.click(); }, [sel, i]);
  const html = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.outerHTML : '(none)'; }, sel);
  const text = (p, sel) => p.evaluate(s => document.querySelector(s)?.textContent ?? '(none)', sel);
  const canvas = async (p, sel) => Buffer.from((await p.evaluate(s => document.querySelector(s).toDataURL('image/png'), sel)).split(',')[1], 'base64');
  const storage = p => p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]), null, 1));
  const shareReady = async p => { await p.waitForFunction(() => !document.querySelector('#share-dl').disabled || /Turn on at least/.test(document.querySelector('#share-status').textContent), null, { timeout: 15000 }); await settle(p, 150); };
  const cardReady = async p => { await settle(p, 320); await p.waitForFunction(() => document.querySelector('#card-status').textContent !== 'Making the card…', null, { timeout: 30000 }); await settle(p, 200); };
  const loadCsv = async (p, csv, name) => { await p.setInputFiles('#file', { name, mimeType: 'text/csv', buffer: Buffer.from(csv) }); await settle(p, 900); };
  const type = async (p, sel, v) => { await p.fill(sel, v); };
  const shot = async (p, name) => rec(name, await p.screenshot({ fullPage: true, animations: 'disabled' }), 'png');
  const cardSnap = async (p, name) => {
    await cardReady(p);
    rec(name + '.status', await text(p, '#card-status'));
    const thumbs = await p.evaluate(() => [...document.querySelectorAll('#card-thumbs img')].map(i => i.src));
    if (thumbs.length) thumbs.forEach((s, i) => rec(`${name}.${i + 1}`, Buffer.from(s.split(',')[1], 'base64'), 'png'));
    else rec(name, await canvas(p, '#card-canvas'), 'png');
    rec(name + '.ui', await html(p, '#cardm .card-opts') + await html(p, '#card-blocked') + await p.evaluate(() => [...document.querySelectorAll('#cardm button')].map(b => `${b.id}|${b.textContent}|${b.hidden}|${b.disabled}`).join('\n')));
  };

  /* ---------- A. welcome + sample, desktop ---------- */
  {
    const p = await ctx({ width: 1280, height: 900 });
    rec('A.welcome', await html(p, '#root')); await shot(p, 'A.welcome.shot');
    await clk(p, '#w-conn input', 4); await settle(p); rec('A.welcome.fontoff', await html(p, '#root') + await storage(p)); await clk(p, '#w-conn input', 4); await settle(p);
    await clk(p, '#try-sample'); await settle(p, 900);
    rec('A.year', await html(p, '#root')); await shot(p, 'A.year.shot'); rec('A.title', await p.title() + ' ' + p.url().split('#')[1]);
    // month view, nav, hash
    await clk(p, '#tabs .tab', 2); await settle(p); rec('A.feb', await html(p, '#main') + (p.url().split('#')[1])); await shot(p, 'A.feb.shot');
    await clk(p, '.mnav [data-go]', 2); await settle(p); rec('A.mar', await html(p, '#main'));
    await clk(p, '.mnav [data-go]', 0); await settle(p);
    // filters: chart bar, tag chip, linky, clear, back button
    await p.evaluate(() => { const h = [...document.querySelectorAll('svg .hit.click')].find(x => /Filter: Fiction/.test(x.getAttribute('aria-label') || '')); h.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await settle(p);
    rec('A.filter.genre', await html(p, '#main') + await html(p, '#tabs'));
    await clk(p, '#tabs .tab', 10); await settle(p); rec('A.filter.genre.oct', await html(p, '#main'));
    await p.goBack(); await settle(p); await p.goBack(); await settle(p); rec('A.filter.back', await html(p, '.top') + (await p.evaluate(() => document.querySelectorAll('.filterbar').length)));
    await p.evaluate(() => location.hash = 'year'); await settle(p);
    await clk(p, '.cloud .chip', 3); await settle(p); rec('A.filter.tag', await html(p, '#main'));
    await p.evaluate(() => [...document.querySelectorAll('.filterbar .btn')].find(b => b.textContent === 'Clear filter').click()); await settle(p);
    await clk(p, '.who [data-f]', 0); await settle(p); rec('A.filter.gender', await html(p, '.filterbar') + await html(p, '.tiles'));
    await p.evaluate(() => [...document.querySelectorAll('.filterbar .btn')].find(b => b.textContent === 'Clear filter').click()); await settle(p);
    await p.evaluate(() => { const h = [...document.querySelectorAll('svg .hit.click')].find(x => /Filter: rated 5/.test(x.getAttribute('aria-label') || '')); h.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await settle(p);
    rec('A.filter.stars', await html(p, '#main'));
    await p.evaluate(() => [...document.querySelectorAll('.filterbar .btn')].find(b => b.textContent === 'Clear filter').click()); await settle(p);
    // tooltip
    await p.hover('svg .hit.click >> nth=0'); await settle(p, 150); rec('A.tip', await html(p, '#tip')); await p.mouse.move(5, 5);
    // tag finder
    await type(p, '.tagfind', 'lon'); await settle(p, 300); rec('A.tagfind', await html(p, '.cloud')); await type(p, '.tagfind', ''); await settle(p, 300);
    // book finder + keyboard
    await p.click('.finder-in'); await p.keyboard.type('the'); await settle(p); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowUp'); await settle(p, 150);
    rec('A.finder', await html(p, '.finder')); await p.keyboard.press('Enter'); await settle(p);
    rec('A.finder.book', await html(p, '#bookm')); await p.keyboard.press('Escape'); await settle(p);
    rec('A.finder.after', await p.evaluate(() => document.activeElement.className + '|' + document.querySelector('.finder-in').value));
    await type(p, '.finder-in', 'zzzz'); await settle(p); rec('A.finder.none', await html(p, '.finder')); await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await settle(p); rec('A.finder.cleared', await html(p, '.finder'));
    // book modal + arrow keys
    await clk(p, '.topshelf button.book', 1); await settle(p); rec('A.book', await html(p, '#bookm'));
    await p.keyboard.press('ArrowRight'); await settle(p); await p.keyboard.press('ArrowRight'); await settle(p); await p.keyboard.press('ArrowLeft'); await settle(p); rec('A.book.arrows', await text(p, '#bookm-h'));
    await p.keyboard.press('Escape'); await settle(p); rec('A.book.focusback', await p.evaluate(() => document.activeElement.getAttribute('aria-label')));
    await clk(p, '.months .strip button.book', 4); await settle(p); await p.keyboard.press('ArrowDown'); await settle(p); await p.keyboard.press('ArrowRight'); await settle(p); await p.keyboard.press('ArrowUp'); await settle(p); rec('A.book.months', await text(p, '#bookm-h')); await p.keyboard.press('Escape'); await settle(p);
    // pasted cover link + copy link + unpin
    await clk(p, '.topshelf button.book', 0); await settle(p);
    await p.fill('#bookm .fix input[type=url]', 'https://covers.test/a.png'); await p.dispatchEvent('#bookm .fix input[type=url]', 'change'); await settle(p, 700);
    rec('A.book.pinned', await html(p, '#bookm-body') + await storage(p));
    await clk(p, '[data-copylink]'); await settle(p); rec('A.book.copylink', await html(p, '#bookm .savenote') + await p.evaluate(() => navigator.clipboard.readText()));
    await p.keyboard.press('Escape'); await settle(p); rec('A.unsaved', await html(p, '#foot')); await clk(p, '[data-picklist]'); await settle(p); rec('A.unsaved.open', await html(p, '#unsaved-line'));
    await clk(p, '[data-pickbook]'); await settle(p); await clk(p, '[data-unpin]'); await settle(p, 600); rec('A.book.unpinned', await html(p, '#bookm-body')); await p.keyboard.press('Escape'); await settle(p);
    // table sort
    await p.evaluate(() => document.querySelector('details.table').open = true); await clk(p, '.tbl-wrap th', 0); await settle(p, 100); await clk(p, '.tbl-wrap th', 0); await settle(p, 100); rec('A.table.title', await html(p, '.tbl-wrap'));
    await p.evaluate(() => [...document.querySelectorAll('.tbl-wrap th')].find(t => /Length/.test(t.textContent)).click()); await settle(p, 100); rec('A.table.len', await html(p, '.tbl-wrap'));
    await clk(p, '.tbl-wrap td button', 2); await settle(p); await p.keyboard.press('ArrowDown'); await settle(p); rec('A.table.book', await text(p, '#bookm-h')); await p.keyboard.press('Escape'); await settle(p);
    // settings
    await clk(p, '#set-open'); await settle(p); rec('A.settings', await html(p, '#setm')); await p.evaluate(() => document.querySelector('#setm details.advanced').open = true); await settle(p, 100);
    await clk(p, '#cf-forget'); await settle(p); rec('A.settings.forget', await text(p, '#cf-msg')); await p.keyboard.press('Escape'); await settle(p);
    // month share image
    await clk(p, '#tabs .tab', 1); await settle(p); await clk(p, '#share-open'); await shareReady(p); rec('A.share.ui', await html(p, '#share .share-opts') + await text(p, '#share-h'));
    for (const f of ['portrait', 'square', 'story']) for (const t of ['light', 'dark']) { await clk(p, `input[name=sfmt][value=${f}]`); await clk(p, `input[name=stheme][value=${t}]`); await shareReady(p); rec(`A.share.${f}.${t}`, await canvas(p, '#share-canvas'), 'png'); rec(`A.share.${f}.${t}.status`, await text(p, '#share-status')); }
    await clk(p, 'input[name=sfmt][value=portrait]'); await clk(p, '#s-ranks'); await clk(p, '#s-stats'); await shareReady(p); rec('A.share.ranks.nostats', await canvas(p, '#share-canvas'), 'png');
    await clk(p, '#s-titles'); await clk(p, '#s-stats'); await clk(p, '#s-credit'); await shareReady(p); rec('A.share.notitles.nocredit', await canvas(p, '#share-canvas'), 'png');
    await type(p, '#s-handle', '@reader'); await settle(p, 400); await shareReady(p); rec('A.share.handle', await canvas(p, '#share-canvas'), 'png');
    await clk(p, '#s-credit'); await clk(p, '#s-titles'); await clk(p, '#s-ranks'); await shareReady(p); rec('A.share.handle.credit', await canvas(p, '#share-canvas'), 'png');
    { const [d] = await Promise.all([p.waitForEvent('download'), clk(p, '#share-dl')]); rec('A.share.dl', d.suggestedFilename() + ' ' + sha(fs.readFileSync(await d.path()))); }
    await clk(p, '#share-copy'); await settle(p, 200); rec('A.share.copy', await text(p, '#share-status'));
    await p.keyboard.press('Escape'); await settle(p);
    // filtered month share with a personal filter
    await p.evaluate(() => location.hash = 'year'); await settle(p);
    await p.evaluate(() => { const h = [...document.querySelectorAll('svg .hit.click')].find(x => /Filter: Libby/.test(x.getAttribute('aria-label') || '')); h.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await settle(p);
    await clk(p, '#wrap-open'); await shareReady(p); await clk(p, 'input[name=smode][value=single]'); await shareReady(p); rec('A.share.year.filter', await canvas(p, '#share-canvas'), 'png'); rec('A.share.year.filter.ui', await html(p, '#share .share-opts') + await text(p, '#share-status'));
    await clk(p, '#s-filter'); await clk(p, 'input[name=scount][value="10"]'); await shareReady(p); rec('A.share.year.filter.named.top10', await canvas(p, '#share-canvas'), 'png');
    await clk(p, 'input[name=scount][value="0"]'); await shareReady(p); rec('A.share.year.all', await canvas(p, '#share-canvas'), 'png');
    await p.keyboard.press('Escape'); await settle(p); await p.evaluate(() => [...document.querySelectorAll('.filterbar .btn')].find(b => b.textContent === 'Clear filter').click()); await settle(p);
    // My Year in Books
    await clk(p, '#wrap-open'); await shareReady(p);
    const walk = async tag => { for (let i = 0; i < 30; i++) { rec(`${tag}.${i + 1}`, await canvas(p, '#share-canvas'), 'png'); rec(`${tag}.${i + 1}.panel`, await html(p, '#w-opts') + await text(p, '#w-pos') + await text(p, '#share-status')); if (await p.evaluate(() => document.querySelector('#w-next').disabled)) break; await clk(p, '#w-next'); await shareReady(p); } for (let i = 0; i < 30 && !(await p.evaluate(() => document.querySelector('#w-prev').disabled)); i++) { await clk(p, '#w-prev'); await shareReady(p); } };
    rec('A.myb.ui', await html(p, '#share')); await walk('A.myb.light');
    await clk(p, 'input[name=stheme][value=dark]'); await shareReady(p); await walk('A.myb.dark'); await clk(p, 'input[name=stheme][value=light]'); await shareReady(p);
    await clk(p, '#w-next'); await shareReady(p); await p.evaluate(() => document.querySelector('#w-basis details').open = true);
    for (const i of [3, 0, 7]) { await clk(p, '#w-basis .w-pick-list input', i); await shareReady(p); } rec('A.myb.picks', await canvas(p, '#share-canvas'), 'png'); rec('A.myb.picks.panel', await html(p, '#w-opts'));
    await clk(p, '#w-add-shelf'); await settle(p, 150); await clk(p, '.w-edit .w-pick-list input', 0); await settle(p, 150); await clk(p, '.w-edit .w-pick-list input', 2); await settle(p, 150); rec('A.myb.shelf.edit', await html(p, '#w-shelves'));
    await type(p, '#w-ed-name', 'My shelf name'); await clk(p, '#w-ed-save'); await shareReady(p); rec('A.myb.shelf', await canvas(p, '#share-canvas'), 'png'); rec('A.myb.shelf.panel', await html(p, '#w-opts') + await text(p, '#w-pos'));
    await clk(p, '#w-basis .w-pick-list input', 1); await shareReady(p); rec('A.myb.shelf.pick', await canvas(p, '#share-canvas'), 'png');
    await clk(p, '#w-shelves [data-edit]'); await settle(p, 150); rec('A.myb.shelf.edit2', await html(p, '#w-shelves')); await clk(p, '#w-ed-cancel'); await settle(p, 150);
    await clk(p, '#w-list li input', 3); await shareReady(p); await clk(p, '#w-list li .mv', 9); await shareReady(p); await clk(p, '#w-list li .nm', 5); await shareReady(p); rec('A.myb.reorder', await html(p, '#w-list') + await text(p, '#w-pos')); rec('A.myb.reorder.img', await canvas(p, '#share-canvas'), 'png');
    await type(p, '#s-handle', '@reader2'); await settle(p, 400); await shareReady(p); rec('A.myb.handle', await canvas(p, '#share-canvas'), 'png');
    { const [d] = await Promise.all([p.waitForEvent('download'), clk(p, '#share-zip')]); rec('A.myb.zip', d.suggestedFilename() + ' ' + sha(fs.readFileSync(await d.path()))); await settle(p, 300); rec('A.myb.zip.status', await text(p, '#share-status')); }
    { const [d] = await Promise.all([p.waitForEvent('download'), clk(p, '#share-dl')]); rec('A.myb.dl', d.suggestedFilename()); }
    await clk(p, '#w-shelves [data-del]'); await shareReady(p); rec('A.myb.shelf.removed', await html(p, '#w-list'));
    await p.keyboard.press('Escape'); await settle(p);
    // feature toggle from the book modal
    await clk(p, '.topshelf button.book', 2); await settle(p); await clk(p, '[data-feat]'); await settle(p, 100); rec('A.feat', await storage(p)); await p.keyboard.press('Escape'); await settle(p);
    // book cards: Frankenstein (short note), all layouts/sizes/looks
    await p.click('.finder-in'); await p.keyboard.type('franken'); await settle(p); await p.keyboard.press('Enter'); await settle(p); await clk(p, '#bookm-card'); await cardSnap(p, 'A.card.default');
    for (const l of ['standard', 'feature', 'long']) for (const s of ['portrait', 'square', 'story']) for (const k of ['light', 'dark']) { await clk(p, `input[name=clayout][value=${l}]`); await clk(p, `input[name=csize][value=${s}]`); await clk(p, `input[name=clook][value=${k}]`); await cardSnap(p, `A.card.${l}.${s}.${k}`); }
    await clk(p, 'input[name=clayout][value=standard]'); await clk(p, 'input[name=csize][value=portrait]'); await clk(p, 'input[name=clook][value=light]');
    for (const k of ['matrix', 'tags', 'length']) await clk(p, '#c-inc-' + k); await cardSnap(p, 'A.card.matrix.tags');
    await clk(p, '#c-tags input', 4); await clk(p, '#c-tags input', 0); await cardSnap(p, 'A.card.tags2');
    for (const k of ['quote', 'mixed', 'review']) { await clk(p, `input[name=ckind][value=${k}]`); await cardSnap(p, 'A.card.kind.' + k); }
    await clk(p, 'input[name=ckind][value=quote]'); await type(p, '#c-attr-who', 'Some Other Reviewer With A Long Name'); await type(p, '#c-attr-from', 'A Very Long Source Work Title That Should Wrap Onto Another Line'); await cardSnap(p, 'A.card.quote.attr');
    await clk(p, 'input[name=clayout][value=feature]'); await cardSnap(p, 'A.card.quote.feature'); await clk(p, 'input[name=clayout][value=standard]');
    await clk(p, 'input[name=cwords][value=excerpt]'); await type(p, '#c-excerpt', LONG); await cardSnap(p, 'A.card.long.toolong');
    await clk(p, 'input[name=clayout][value=long]'); await cardSnap(p, 'A.card.long.portrait');
    await clk(p, 'input[name=csize][value=square]'); await cardSnap(p, 'A.card.long.square'); await clk(p, '#card-thumbs button', 1); await settle(p, 100); rec('A.card.long.page2', await canvas(p, '#card-canvas'), 'png');
    { const [d] = await Promise.all([p.waitForEvent('download'), clk(p, '#card-zip')]); rec('A.card.zip', d.suggestedFilename() + ' ' + sha(fs.readFileSync(await d.path()))); }
    { const [d] = await Promise.all([p.waitForEvent('download'), clk(p, '#card-dl')]); rec('A.card.dl', d.suggestedFilename() + ' ' + sha(fs.readFileSync(await d.path()))); }
    await clk(p, '#card-copy'); await settle(p, 200); rec('A.card.copy', await text(p, '#card-status'));
    await clk(p, '#c-copytext'); await settle(p, 200); rec('A.card.copytext', await html(p, '#c-keep-f'));
    await clk(p, 'input[name=clayout][value=standard]'); await cardSnap(p, 'A.card.long.forced.standard');
    await clk(p, '#c-revert'); await cardSnap(p, 'A.card.reverted');
    await clk(p, 'input[name=cwords][value=none]'); await cardSnap(p, 'A.card.none');
    await type(p, '#c-handle', '@cardhandle'); await clk(p, '#c-credit'); await clk(p, '#c-p-source'); await clk(p, '#c-p-found'); await cardSnap(p, 'A.card.personal.handle');
    await p.setInputFiles('#card-file', { name: 'own.png', mimeType: 'image/png', buffer: IMG.b }); await cardSnap(p, 'A.card.ownimage');
    await p.keyboard.press('Escape'); await settle(p);
    // a DNF book and a book with no text
    await p.click('.finder-in'); await p.keyboard.type('moby'); await settle(p); await p.keyboard.press('Enter'); await settle(p); rec('A.book.dnf', await html(p, '#bookm')); await clk(p, '#bookm-card'); await cardSnap(p, 'A.card.dnf'); await p.keyboard.press('Escape'); await settle(p);
    await p.click('.finder-in'); await p.keyboard.press('Control+A'); await p.keyboard.type('sign of'); await settle(p); await p.keyboard.press('Enter'); await settle(p); await clk(p, '#bookm-card'); await cardSnap(p, 'A.card.notext'); await p.keyboard.press('Escape'); await settle(p);
    // resize redraw, back to start
    await p.setViewportSize({ width: 700, height: 900 }); await settle(p, 500); rec('A.year.narrow', await html(p, '#main')); await shot(p, 'A.year.narrow.shot');
    rec('A.storage', await storage(p));
    await p.evaluate(() => [...document.querySelectorAll('.filterbar .btn')].find(b => b.textContent === 'Back to start').click()); await settle(p); rec('A.backtostart', await html(p, '#root'));
    await p.context().close();
  }

  /* ---------- B. custom file with covers, issues, multiple years ---------- */
  {
    const p = await ctx({ width: 1280, height: 900 }, { proxy: true });
    await loadCsv(p, CUSTOM, 'custom.csv'); await settle(p, 800);
    rec('B.year', await html(p, '#root')); await shot(p, 'B.year.shot'); rec('B.storage0', await storage(p));
    await clk(p, '.report .btn', 0); await settle(p); rec('B.report', await html(p, '.report')); await clk(p, '.report .btn', 1); await settle(p);
    await p.selectOption('.yearsel', '2026'); await settle(p, 600); rec('B.2026', await html(p, '#main') + p.url().split('#')[1]); await p.selectOption('.yearsel', '2025'); await settle(p, 600);
    await p.evaluate(() => [...document.querySelectorAll('.filterbar .btn')].find(b => b.textContent === 'Keep current')?.click()); await settle(p);
    await clk(p, '#tabs .tab', 1); await settle(p, 600); rec('B.jan', await html(p, '#main')); await shot(p, 'B.jan.shot');
    await clk(p, '.shelf button.book', 0); await settle(p, 500); rec('B.book', await html(p, '#bookm')); await clk(p, '#bookm-card'); await cardSnap(p, 'B.card.long');
    await clk(p, '#card-proxy').catch(() => { }); await cardSnap(p, 'B.card.long.2');
    await p.keyboard.press('Escape'); await settle(p);
    await clk(p, '.shelf button.book', 1); await settle(p, 500); rec('B.book2', await html(p, '#bookm')); await clk(p, '#bookm-card'); await cardSnap(p, 'B.card.cover');
    await clk(p, 'input[name=clayout][value=feature]'); await cardSnap(p, 'B.card.cover.feature'); await p.keyboard.press('Escape'); await settle(p);
    await clk(p, '#share-open'); await shareReady(p); rec('B.share', await canvas(p, '#share-canvas'), 'png'); rec('B.share.status', await text(p, '#share-status')); await p.keyboard.press('Escape'); await settle(p);
    await p.evaluate(() => location.hash = '2025-year'); await settle(p, 500);
    // Gamma: blocked cover with no alternative -> blocked notice, then proxy
    await p.click('.finder-in'); await p.keyboard.type('gamma'); await settle(p); await p.keyboard.press('Enter'); await settle(p, 500); await clk(p, '#bookm-card'); await cardSnap(p, 'B.card.blocked');
    await clk(p, '#card-proxy'); await cardSnap(p, 'B.card.proxied'); await p.keyboard.press('Escape'); await settle(p);
    // Beta: blocked Cover URL, Found cover available -> swapped notice, keep
    await p.click('.finder-in'); await p.keyboard.press('Control+A'); await p.keyboard.type('beta'); await settle(p); await p.keyboard.press('Enter'); await settle(p, 500); await clk(p, '#bookm-card'); await cardSnap(p, 'B.card.swapped');
    await clk(p, '#card-keep'); await cardSnap(p, 'B.card.swapped.kept'); await p.keyboard.press('Escape'); await settle(p);
    // Eta: mixed
    await p.click('.finder-in'); await p.keyboard.press('Control+A'); await p.keyboard.type('eta'); await settle(p); rec('B.finder.eta', await html(p, '.finder-list')); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await settle(p, 500); rec('B.book.eta', await text(p, '#bookm-h')); await clk(p, '#bookm-card'); await cardSnap(p, 'B.card.eta'); await p.keyboard.press('Escape'); await settle(p);
    // MYB with covers
    await clk(p, '#wrap-open'); await shareReady(p);
    for (let i = 0; i < 12; i++) { rec(`B.myb.${i + 1}`, await canvas(p, '#share-canvas'), 'png'); rec(`B.myb.${i + 1}.panel`, await html(p, '#w-opts') + await text(p, '#share-status')); if (await p.evaluate(() => document.querySelector('#w-next').disabled)) break; await clk(p, '#w-next'); await shareReady(p); }
    { const [d] = await Promise.all([p.waitForEvent('download'), clk(p, '#share-zip')]); rec('B.myb.zip', d.suggestedFilename() + ' ' + sha(fs.readFileSync(await d.path()))); }
    await p.keyboard.press('Escape'); await settle(p);
    // settings: turn on the proxy, found covers copy
    await clk(p, '#set-open'); await settle(p); await clk(p, '#setm .tog input', 3); await settle(p, 600); await p.evaluate(() => document.querySelector('#setm details.advanced').open = true); await clk(p, '#cf-copy'); await settle(p, 200);
    rec('B.settings', await html(p, '#setm-body') + '\n' + await p.evaluate(() => navigator.clipboard.readText())); await p.keyboard.press('Escape'); await settle(p);
    await clk(p, '#wrap-open'); await shareReady(p); await clk(p, 'input[name=smode][value=single]'); await shareReady(p); rec('B.share.proxy', await canvas(p, '#share-canvas'), 'png'); rec('B.share.proxy.status', await text(p, '#share-status')); await p.keyboard.press('Escape'); await settle(p);
    rec('B.foot', await html(p, '#foot')); rec('B.storage', await storage(p));
    // reload: saved data comes back
    await p.reload(); await settle(p, 900); rec('B.reload', await html(p, '#main') + p.url().split('#')[1]);
    await clk(p, '#forget'); await settle(p, 900); rec('B.forgot', await html(p, '#root') + await storage(p));
    // bad file
    await loadCsv(p, 'a,b\n1,2', 'bad.csv'); rec('B.bad', await html(p, '.dropzone'));
    await p.context().close();
  }

  /* ---------- C. cover lookup on (mocked services) ---------- */
  {
    const p = await ctx({ width: 1280, height: 900 }, { lookup: true });
    await p.evaluate(() => { localStorage.setItem('wrapup:settings', JSON.stringify({ coverUrls: true, coverLookup: true, googleBooks: true, exportProxy: false, webFont: false, dataUrl: '' })); localStorage.setItem('wrapup:settings-seen', '1'); });
    await p.reload(); await loadCsv(p, CUSTOM, 'custom.csv');
    await p.waitForFunction(() => /Covers are in/.test(document.querySelector('#looktoast').textContent), null, { timeout: 60000 }).catch(() => errs.push('lookup toast never finished'));
    rec('C.toast', await html(p, '#looktoast')); rec('C.year', await html(p, '#main')); rec('C.storage', await storage(p));
    await clk(p, '#set-open'); await settle(p, 300); rec('C.settings', await html(p, '#setm-body')); await p.keyboard.press('Escape'); await settle(p);
    await p.click('.finder-in'); await p.keyboard.type('epsilon'); await settle(p); await p.keyboard.press('Enter'); await settle(p, 500); rec('C.book', await html(p, '#bookm')); await p.keyboard.press('Escape');
    rec('C.foot', await html(p, '#foot'));
    await p.context().close();
  }

  /* ---------- D. a real reading log, if one was given ---------- */
  if (OWN_CSV && fs.existsSync(OWN_CSV)) {
    const p = await ctx({ width: 1280, height: 900 });
    await loadCsv(p, fs.readFileSync(OWN_CSV, 'utf8'), 'own.csv'); await settle(p, 1500);
    rec('D.year', await html(p, '#root')); await shot(p, 'D.year.shot');
    await clk(p, '#tabs .tab', 3); await settle(p, 800); rec('D.month', await html(p, '#main')); await shot(p, 'D.month.shot');
    await clk(p, '#share-open'); await shareReady(p); rec('D.share', await canvas(p, '#share-canvas'), 'png'); await p.keyboard.press('Escape'); await settle(p);
    await p.evaluate(() => location.hash = 'year'); await settle(p, 1200);
    await clk(p, '#wrap-open'); await shareReady(p);
    for (let i = 0; i < 20; i++) { rec(`D.myb.${i + 1}`, await canvas(p, '#share-canvas'), 'png'); rec(`D.myb.${i + 1}.panel`, await html(p, '#w-opts')); if (await p.evaluate(() => document.querySelector('#w-next').disabled)) break; await clk(p, '#w-next'); await shareReady(p); }
    await p.keyboard.press('Escape'); await settle(p);
    await clk(p, '.topshelf button.book', 0); await settle(p); rec('D.book', await html(p, '#bookm')); await clk(p, '#bookm-card'); await cardSnap(p, 'D.card'); await clk(p, '#c-inc-matrix'); await clk(p, '#c-inc-tags'); await cardSnap(p, 'D.card.matrix');
    await p.context().close();
  }

  /* ---------- E. phone ---------- */
  {
    const p = await ctx({ width: 390, height: 844 }, { touch: true });
    rec('E.welcome', await html(p, '#root')); await clk(p, '#try-sample'); await settle(p, 900);
    rec('E.year', await html(p, '#root')); await shot(p, 'E.year.shot');
    await p.evaluate(() => { const h = document.querySelector('svg .hit.click'); h.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 100, clientY: 300 })); }); await settle(p, 150); rec('E.tap1', await html(p, '#tip') + p.url().split('#')[1]);
    await p.evaluate(() => { const h = document.querySelector('svg .hit.click'); h.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 100, clientY: 300 })); }); await settle(p, 400); rec('E.tap2', await html(p, '.top') + p.url().split('#')[1]);
    await clk(p, 'button.book', 0); await settle(p); rec('E.book', await html(p, '#bookm')); await shot(p, 'E.book.shot');
    await p.context().close();
  }

  fs.writeFileSync(path.join(OUT, '_results.json'), JSON.stringify(R, null, 1));
  fs.writeFileSync(path.join(OUT, '_errors.txt'), errs.join('\n'));
  console.log(Object.keys(R).length, 'records;', errs.length, 'errors'); if (errs.length) console.log(errs.slice(0, 8).join('\n'));
  await browser.close();
})().catch(e => { console.error('HARNESS FAILED', e.message.split('\n')[0], '\npage errors:', (global.__errs || []).slice(0, 5)); process.exit(1); });
