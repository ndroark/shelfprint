// Builds guide/index.html, the guide at shelfprint.org/guide, from README.md. The README is the source: edit it,
// then run `node guide.js` and commit both. `node guide.js --check` writes nothing and fails if the guide is out of date.
const fs = require("fs");
const path = require("path");
const { Marked } = require("marked");
const { gfmHeadingId } = require("marked-gfm-heading-id");

const root = path.join(__dirname, "..");
const out = path.join(root, "guide", "index.html");
const REPO = "https://github.com/ndroark/shelfprint";

let md = fs.readFileSync(path.join(root, "README.md"), "utf8");
// The page has its own title and its own link back to the front page.
md = md.replace(/^# Shelfprint\s*\n/, "").replace(" · [shelfprint.org](https://shelfprint.org)", "");

const marked = new Marked({ gfm: true });
marked.use(gfmHeadingId());
marked.use({
  walkTokens(t) {
    // The guide is one folder down from the README, so links to files in the repository need adjusting.
    if (t.type === "image" && !/^https?:/.test(t.href)) t.href = "../" + t.href;
    if (t.type === "link" && !/^(https?:|#|mailto:)/.test(t.href)) t.href = `${REPO}/blob/main/${t.href}`;
  },
});
let body = marked.parse(md);
// Wide tables scroll inside their own box on small screens.
body = body.replace(/<table>/g, '<div class="table"><table>').replace(/<\/table>/g, "</table></div>");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shelfprint guide: the spreadsheet, the page, and My Year in Books</title>
<meta name="description" content="How to use Shelfprint: the Shelfprint Tracker spreadsheet and its columns, loading your reading log, monthly wrap-ups, image cards, My Year in Books, privacy settings, and hosting your own copy.">
<link rel="canonical" href="https://shelfprint.org/guide/">
<link rel="icon" type="image/x-icon" href="../favicon.ico">
<link rel="icon" type="image/png" sizes="192x192" href="../favicon.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Shelfprint">
<meta property="og:title" content="Shelfprint guide">
<meta property="og:description" content="The Shelfprint Tracker spreadsheet, the Shelfprint page, image cards, monthly wrap-ups, and My Year in Books, explained.">
<meta property="og:url" content="https://shelfprint.org/guide/">
<meta property="og:image" content="https://shelfprint.org/site/social-preview.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="../site/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face {
  font-family: "Newsreader";
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
  src: url("../site/newsreader-latin.woff2") format("woff2");
}
:root {
  color-scheme: light dark;
  --page: #f6f4ef;
  --surface-2: #f0efec;
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --border: rgba(11, 11, 11, 0.12);
  --accent: #8a3b1f;
}
@media (prefers-color-scheme: dark) {
  :root {
    --page: #0d0d0d;
    --surface-2: #242422;
    --text-primary: #f0efec;
    --text-secondary: #c3c2b7;
    --border: rgba(255, 255, 255, 0.12);
    --accent: #e39a76;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--page);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 17px;
  line-height: 1.6;
}
img { max-width: 100%; height: auto; }
a { color: var(--accent); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }
h1, h2, h3, .wordmark {
  font-family: "Newsreader", Georgia, "Times New Roman", serif;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 0; }
.wordmark { font-size: 22px; color: var(--text-primary); text-decoration: none; }
.top nav { display: flex; gap: 22px; font-size: 15px; }
.top nav a { color: var(--text-secondary); text-decoration: none; }
.top nav a:hover { color: var(--text-primary); text-decoration: underline; }
main { max-width: 780px; padding: 24px 0 64px; }
h1 { font-size: clamp(38px, 5.4vw, 56px); margin: 0 0 20px; }
h2 { font-size: 32px; margin: 56px 0 14px; scroll-margin-top: 16px; }
h3 { font-size: 23px; margin: 36px 0 10px; scroll-margin-top: 16px; }
hr { border: 0; border-top: 1px solid var(--border); margin: 44px 0; }
li { margin: 6px 0; }
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em; background: var(--surface-2); padding: 0.1em 0.35em; border-radius: 4px;
}
pre { background: var(--surface-2); padding: 16px; border-radius: 8px; overflow-x: auto; }
pre code { background: none; padding: 0; font-size: 14px; }
.table { overflow-x: auto; margin: 18px 0; }
table { border-collapse: collapse; width: 100%; min-width: 560px; font-size: 15px; line-height: 1.45; }
th, td { text-align: left; vertical-align: top; padding: 9px 12px; border-bottom: 1px solid var(--border); }
th { font-weight: 600; white-space: nowrap; }
footer { border-top: 1px solid var(--border); padding: 32px 0 56px; color: var(--text-secondary); font-size: 15px; }
@media (max-width: 820px) { body { font-size: 16px; } h2 { font-size: 28px; } }
</style>
</head>
<body>
<div class="wrap">
<header class="top">
  <a class="wordmark" href="../">Shelfprint</a>
  <nav aria-label="Site">
    <a href="../app/">Open Shelfprint</a>
    <a href="${REPO}">GitHub</a>
  </nav>
</header>
<main>
<h1>Shelfprint guide</h1>
${body}</main>
<footer>
  <p>This guide is the project's <a href="${REPO}#readme">README</a>, shown here for reading. <a href="../">Back to the front page</a>.</p>
</footer>
</div>
</body>
</html>
`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
  if (current !== html) {
    console.error("FAIL  guide/index.html is out of date with README.md. Run `node guide.js` and commit the result.");
    process.exit(1);
  }
  console.log("ok    guide/index.html matches README.md");
} else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log("wrote guide/index.html");
}
