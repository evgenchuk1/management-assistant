// בונה data-snapshot.js — עותק נתונים מהאפליקציות (גיבוי כשאין אינטרנט).
// הרצה: node build-snapshot.js
const fs = require('fs');
const path = require('path');

function extract(src, name) {
  const re = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=\\s*');
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  const start = i;
  let depth = 0, q = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') depth--;
    else if (c === ';' && depth === 0) break;
  }
  return src.slice(start, i).trim();
}

const home = path.join(__dirname, '..');
const spira = fs.readFileSync(path.join(home, 'order-schedule-repo', 'spira.html'), 'utf8');
const orders = fs.readFileSync(path.join(home, 'order-schedule-repo', 'index.html'), 'utf8');
const sidur = fs.readFileSync(path.join(home, 'סידור-עבודה', 'index.html'), 'utf8');

const out = {};
for (const n of ['CHOR', 'PACHAT', 'YOMI']) out[n] = extract(spira, n);
out.SCH = extract(orders, 'SCH');
for (const n of ['SEED', 'SEED_LABEL', 'DEPTS']) out[n] = extract(sidur, n);

let js = '// נוצר אוטומטית ע"י build-snapshot.js — ' + new Date().toISOString() + '\n';
js += 'window.SNAPSHOT = {\n';
for (const [k, v] of Object.entries(out)) {
  if (!v) throw new Error('missing ' + k);
  js += '  ' + k + ': ' + v + ',\n';
}
js += '};\n';
fs.writeFileSync(path.join(__dirname, 'data-snapshot.js'), js);
// בדיקה
global.window = {};
eval(js);
const s = window.SNAPSHOT;
console.log('CHOR', s.CHOR.length, 'PACHAT', s.PACHAT.length, 'YOMI', s.YOMI.length,
  'SCH days', Object.keys(s.SCH).length, 'SEED depts', Object.keys(s.SEED).length, 'label', s.SEED_LABEL);
