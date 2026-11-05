/* Gender Neutral Language Recognizer - detection logic (regular expression approach) */
const TERMS = [
  ["chairman", ["chairperson", "chair"]], ["chairmen", ["chairpersons", "chairs"]],
  ["policeman", ["police officer"]], ["policemen", ["police officers"]],
  ["fireman", ["firefighter"]], ["firemen", ["firefighters"]],
  ["stewardess", ["flight attendant"]], ["mankind", ["humankind", "humanity"]],
  ["businessman", ["businessperson"]], ["salesman", ["salesperson", "sales representative"]],
  ["mailman", ["mail carrier"]], ["spokesman", ["spokesperson"]],
  ["congressman", ["legislator", "member of Congress"]], ["foreman", ["supervisor"]],
  ["cameraman", ["camera operator"]], ["layman", ["layperson"]],
  ["craftsman", ["artisan", "craftsperson"]], ["forefathers", ["ancestors"]],
  ["manpower", ["workforce", "personnel"]], ["man-made", ["artificial", "synthetic"]],
  ["waitress", ["server"]], ["actress", ["actor"]],
  ["headmaster", ["principal", "head teacher"]], ["housewife", ["homemaker"]],
  ["freshman", ["first-year student"]], ["ladies and gentlemen", ["everyone", "honored guests"]],
  ["he or she", ["they"]], ["his or her", ["their"]],
];

const LOOKUP = Object.fromEntries(TERMS);
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Longest terms first. A space inside a phrase matches any run of whitespace (so a line break
// between words still matches). \b on both sides gives whole-word matching: "he" never matches in "the".
const PATTERN = new RegExp(
  "\\b(?:" + TERMS.map(t => t[0]).sort((a, b) => b.length - a.length)
    .map(t => escapeRe(t).replace(/ /g, "\\s+")).join("|") + ")\\b",
  "gi" // g = find every match, i = ignore capitalization
);

function analyze(text) {
  const counts = new Map(), hits = [];
  for (const m of text.matchAll(PATTERN)) {
    const key = m[0].toLowerCase().replace(/\s+/g, " ");
    counts.set(key, (counts.get(key) || 0) + 1);
    hits.push({ key, start: m.index, end: m.index + m[0].length });
  }
  const rows = [...counts].map(([term, count]) => ({ term, count, suggestions: LOOKUP[term] }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
  return { rows, hits, total: hits.length };
}

function inspectFile(name, text) {
  if (!/\.txt$/i.test(name)) return { status: "unsupported" };
  if (!text.trim()) return { status: "empty" };
  const r = analyze(text);
  return r.total ? { status: "found", ...r } : { status: "none" };
}

if (typeof module !== "undefined") module.exports = { TERMS, PATTERN, analyze, inspectFile };
