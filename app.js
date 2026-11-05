const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const MESSAGES = {
  unsupported: ["error", "Unsupported file format", "Only plain text (.txt) files can be checked. Please choose a .txt file."],
  empty: ["warn", "This file is empty", "There is no text to check. Choose a .txt file that contains some writing."],
  none: ["ok", "No predefined gender-specific terms were detected.", "Nothing in this file matched the term list."],
};

function show(result) {
  const notice = $("#notice"), results = $("#results");
  notice.hidden = results.hidden = true;
  if (result.status !== "found") {
    const [kind, title, body] = MESSAGES[result.status];
    notice.className = "notice " + kind;
    notice.querySelector("h2").textContent = title;
    notice.querySelector("p").textContent = body;
    notice.hidden = false;
    return;
  }
  $("#summary").textContent = `${result.rows.length} ${result.rows.length === 1 ? "term" : "terms"} found, ${result.total} ${result.total === 1 ? "occurrence" : "occurrences"} in total`;
  $("#rows").innerHTML = result.rows.map(r =>
    `<tr><td><b>${esc(r.term)}</b></td><td class="num">${r.count}</td><td>${r.suggestions.map(s => `<span class="chip">${esc(s)}</span>`).join("")}</td></tr>`).join("");
  let html = "", pos = 0;
  for (const h of result.hits) {
    html += esc(show.text.slice(pos, h.start)) + `<mark title="Try: ${esc(LOOKUP[h.key].join(", "))}">${esc(show.text.slice(h.start, h.end))}</mark>`;
    pos = h.end;
  }
  $("#preview").innerHTML = html + esc(show.text.slice(pos));
  results.hidden = false;
}

function handleFile(file) {
  if (!file) return;
  $("#fileName").textContent = file.name;
  $("#fileName").hidden = false;
  if (!/\.txt$/i.test(file.name)) { show.text = ""; return show(inspectFile(file.name, "")); }
  const reader = new FileReader();
  reader.onload = () => { show.text = String(reader.result); show(inspectFile(file.name, show.text)); };
  reader.readAsText(file);
}

const drop = $("#drop"), input = $("#file");
input.addEventListener("change", () => { handleFile(input.files[0]); input.value = ""; });
drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => handleFile(e.dataTransfer.files[0]));

$("#pattern").textContent = PATTERN.toString();
$("#terms").innerHTML = TERMS.map(([t, s]) => `<li><b>${esc(t)}</b> <span>${esc(s.join(", "))}</span></li>`).join("");
