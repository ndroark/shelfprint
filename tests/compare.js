// Checks that a change to shelfprint.html didn't change what the page does. It takes the page as it is in git
// (main by default), runs snapshot.js on that and on the file in your working folder, and lists every record
// that differs. A change that is meant to alter the page will show up here: read the list and check that it is
// what you meant, and nothing more.
//   node compare.js [git-ref]
const { execFileSync, spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const ref = process.argv[2] || "main", root = path.join(__dirname, ".."), out = path.join(__dirname, "out");
fs.mkdirSync(out, { recursive: true });
const oldHtml = path.join(out, "old.html");
fs.writeFileSync(oldHtml, execFileSync("git", ["show", `${ref}:shelfprint.html`], { cwd: root, maxBuffer: 1 << 26 }));
const snap = (html, dir) => new Promise((resolve, reject) => {
  fs.rmSync(dir, { recursive: true, force: true });
  const p = spawn("node", [path.join(__dirname, "snapshot.js"), html, dir], { stdio: ["ignore", "inherit", "inherit"] });
  p.on("exit", code => (code ? reject(new Error("snapshot.js failed")) : resolve(JSON.parse(fs.readFileSync(path.join(dir, "_results.json"), "utf8")))));
});
const differing = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => a[k] !== b[k]);
(async () => {
  const run = async tag => Promise.all([snap(oldHtml, path.join(out, "old" + tag)), snap(path.join(root, "shelfprint.html"), path.join(out, "new" + tag))]);
  let [a, b] = await run("");
  let diff = differing(a, b);
  // Full-page screenshots occasionally differ by a pixel of text smoothing. If they are all that differs, look again.
  if (diff.length && diff.every(k => k.endsWith(".shot"))) { const [a2, b2] = await run("2"); diff = diff.filter(k => a2[k] !== b2[k]); }
  const errors = fs.readFileSync(path.join(out, "new", "_errors.txt"), "utf8").trim();
  console.log(`\n${Object.keys(b).length} records compared with ${ref}; ${diff.length} differ.`);
  diff.forEach(k => console.log("  " + k));
  if (diff.length) console.log(`\nThe recorded files are in ${path.relative(process.cwd(), out)}/old and /new, under these names.`);
  if (errors) console.log("\nErrors on the page:\n" + errors);
  process.exit(diff.length || errors ? 1 : 0);
})().catch(e => { console.error(e.message); process.exit(1); });
