// Run with: node tests/test.js
const fs = require("fs"), path = require("path");
const { inspectFile } = require("../recognizer.js");
const dir = __dirname;
for (const name of fs.readdirSync(dir).filter(f => f.startsWith("test") && f !== "test.js").sort()) {
  const text = /\.txt$/i.test(name) ? fs.readFileSync(path.join(dir, name), "utf8") : "";
  const r = inspectFile(name, text);
  console.log(`\n${name} -> ${r.status}`);
  (r.rows || []).forEach(x => console.log(`  ${x.term}: ${x.count} (${x.suggestions.join(", ")})`));
}
