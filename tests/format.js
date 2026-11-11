// Formats the page's script and stylesheet in place with Prettier, leaving the HTML markup and the SETTINGS
// block exactly as they are.   node format.js [path-to-html]
const fs = require("fs"), path = require("path"), prettier = require("prettier");
const file = path.resolve(process.argv[2] || path.join(__dirname, "..", "shelfprint.html"));
(async () => {
  const options = JSON.parse(fs.readFileSync(path.join(__dirname, ".prettierrc"), "utf8"));
  const html = fs.readFileSync(file, "utf8");
  const scriptOpen = html.lastIndexOf("<script>\n"), scriptClose = html.lastIndexOf("</script>");
  const styleOpen = html.indexOf("<style>\n"), styleClose = html.indexOf("</style>");
  if ([scriptOpen, scriptClose, styleOpen, styleClose].some(i => i < 0) || styleClose > scriptOpen) throw new Error("Couldn't find the page's <style> and main <script>.");
  const css = await prettier.format(html.slice(styleOpen + 8, styleClose), { ...options, parser: "css" });
  const js = await prettier.format(html.slice(scriptOpen + 9, scriptClose), { ...options, parser: "babel" });
  const out = html.slice(0, styleOpen + 8) + css + html.slice(styleClose, scriptOpen + 9) + js + html.slice(scriptClose);
  if (out === html) return console.log("Already formatted.");
  fs.writeFileSync(file, out);
  console.log("Formatted", path.basename(file));
})().catch(e => { console.error(e.message); process.exit(1); });
