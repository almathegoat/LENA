// content/balance.js — Lena : lit à voix haute le solde affiché sur la page.
// LECTURE SEULE : ne modifie, ne clique et n'envoie rien dans la page de la banque.
// Aucune dépendance à des id/classes : on lit le texte VISIBLE (document.body.innerText).
(() => {
  'use strict';

  const CONFIG = {
    AUTO_ANNOUNCE: false,  // true = lit le solde au 1er clic/touche sur la page (désactivé : Lena ne parle que sur demande)
    TOAST_MS: 10000        // durée d'affichage de la bulle écrite
  };

  // ---------- 1. Repérer « libellé de solde + montant » dans le texte visible ----------
  const CUR = String.raw`(?:F\s?CFA|FCFA|XAF|XOF|CFA|EUR|USD|€|\$|F(?![A-Za-zÀ-ÿ0-9]))`;
  const NUM = String.raw`[-−–]?(?:\d{1,3}(?:[ \u00A0\u202F.,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)`;
  const AMOUNT = String.raw`(?:(${CUR})\s?)?(${NUM})(?:\s?(${CUR}))?`;
  // séparateurs autorisés entre le libellé et le montant (rien d'autre : sinon on risque de lire les frais)
  const GAP = String.raw`(?:[\s:=—]|[-–](?=\s)|\b(?:est|is)\b)*`;

  const LABEL = /\b(?:(?:available|current|account|total)\s+)?(?:solde|balance)(?:\s+(?:disponible|actuel|courant|total|du\s+compte))?/gi;
  const ANCHORED = new RegExp('^(' + GAP + ')' + AMOUNT, 'i');
  const MASKED = new RegExp('^' + GAP + '[•●*·]{3,}');

  // Texte visible de la page, SANS le panneau de Lena (sinon ses propres réponses seraient relues comme des soldes)
  function pageText() {
    if (!document.body) return '';
    let t = document.body.innerText || '';
    const own = document.getElementById('lena-root');
    const ownText = own ? (own.innerText || '') : '';
    if (ownText.trim()) t = t.replace(ownText, '\n');
    return t;
  }

  function findBalances() {
    const text = pageText();
    const re = new RegExp(LABEL.source, 'gi');
    const found = [];
    let m;
    while ((m = re.exec(text))) {
      const before = text.slice(Math.max(0, m.index - 16), m.index);
      const rest = text.slice(m.index + m[0].length);
      if (/insuffisant|insufficient/i.test(before)) continue;   // « Solde insuffisant » n'est pas un solde
      if (/^\s*(insuffisant|insufficient)/i.test(rest)) continue;
      if (MASKED.test(rest)) { found.push({ label: m[0], masked: true }); continue; }
      const a = rest.match(ANCHORED);
      if (!a) continue;
      if (!(a[2] || a[4])) continue;            // pas de devise = pas un montant (ex. numéro d'étape « 2 »)
      found.push({
        label: m[0],
        raw: a[0].slice(a[1].length).trim(),   // exactement ce qui est affiché
        currency: a[2] || a[4] || '',
        number: a[3]
      });
    }
    // même libellé + même montant affiché à plusieurs endroits de la page = un seul solde
    const seen = new Set();
    return found.filter((f) => {
      let key = labelFr(f.label) + '|';
      if (f.masked) key += 'masque';
      else {
        const { neg, int, dec } = parseNumber(f.number);
        const c = f.currency.toUpperCase().replace(/\s/g, '');
        key += (neg ? '-' : '') + int + '.' + dec.replace(/0+$/, '') + '|' + (/CFA|XAF|XOF|^F$/.test(c) ? 'CFA' : c);
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ---------- 2. Nombre -> mots français (évite que la voix lise mal « 25.000 ») ----------
  const U = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
  const T = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

  function b100(n, fin) {
    if (n < 17) return U[n];
    if (n < 20) return 'dix-' + U[n - 10];
    if (n < 70) { const t = Math.floor(n / 10), u = n % 10; return u === 0 ? T[t] : u === 1 ? T[t] + ' et un' : T[t] + '-' + U[u]; }
    if (n < 80) { const r = n - 60; return r === 11 ? 'soixante et onze' : 'soixante-' + b100(r); }
    if (n === 80) return fin ? 'quatre-vingts' : 'quatre-vingt';
    return 'quatre-vingt-' + b100(n - 80);
  }
  function b1000(n, fin) {
    const h = Math.floor(n / 100), r = n % 100;
    if (!h) return b100(r, fin);
    const c = h === 1 ? 'cent' : U[h] + ' cent';
    return r ? c + ' ' + b100(r, fin) : c + (h > 1 && fin ? 's' : '');
  }
  function words(n) {
    if (n === 0) return 'zéro';
    const g = Math.floor(n / 1e9), m = Math.floor(n / 1e6) % 1000, k = Math.floor(n / 1e3) % 1000, r = n % 1000;
    const p = [];
    if (g) p.push(b1000(g, true) + ' milliard' + (g > 1 ? 's' : ''));
    if (m) p.push(b1000(m, true) + ' million' + (m > 1 ? 's' : ''));
    if (k) p.push(k === 1 ? 'mille' : b1000(k, false) + ' mille');
    if (r) p.push(b1000(r, true));
    return p.join(' ');
  }

  function parseNumber(raw) {
    const neg = /^[-−–]/.test(raw.trim());
    const s = raw.trim().replace(/^[-−–]/, '');
    const lastSep = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
    let int = s.replace(/\D/g, ''), dec = '';
    if (lastSep > -1) {
      const sep = s[lastSep], other = sep === '.' ? ',' : '.';
      const after = s.slice(lastSep + 1).replace(/\D/g, '');
      const count = s.split(sep).length - 1;
      const isDecimal = s.includes(other) || (count === 1 && after.length !== 3);
      if (isDecimal) { int = s.slice(0, lastSep).replace(/\D/g, ''); dec = after; }
    }
    return { neg, int, dec };
  }

  function amountWords(f) {
    const { neg, int, dec } = parseNumber(f.number);
    const n = Number(int);
    let out = int.length > 12 ? int.split('').join(' ') : words(n);
    if (dec && /[1-9]/.test(dec)) {
      const zeros = (dec.match(/^0*/)[0] || '').length;
      out += ' virgule ' + 'zéro '.repeat(zeros) + (dec.slice(zeros) ? words(Number(dec.slice(zeros))) : '');
    }
    const c = f.currency.toUpperCase().replace(/\s/g, '');
    const one = n === 1 && !(dec && /[1-9]/.test(dec));
    let cur = '';
    if (/CFA|XAF|XOF|^F$/.test(c)) cur = one ? 'franc CFA' : 'francs CFA';
    else if (c === '€' || c === 'EUR') cur = one ? 'euro' : 'euros';
    else if (c === '$' || c === 'USD') cur = one ? 'dollar' : 'dollars';
    const de = cur && n >= 1e6 && n % 1e6 === 0 && !dec ? ' de' : '';   // « un million de francs »
    return (neg ? 'moins ' : '') + out + de + (cur ? ' ' + cur : '');
  }

  const LABEL_FR = { 'available balance': 'solde disponible', 'current balance': 'solde actuel',
                     'account balance': 'solde du compte', 'total balance': 'solde total', 'balance': 'solde' };
  function labelFr(l) {
    const k = l.toLowerCase().replace(/\s+/g, ' ');
    const v = LABEL_FR[k] || k;
    return v.charAt(0).toUpperCase() + v.slice(1);
  }

  // Texte écrit (montant EXACTEMENT comme affiché) et texte parlé (montant en mots)
  function report() {
    const found = findBalances().slice(0, 4);
    if (!found.length) {
      const t = "Je ne trouve pas de solde sur cette page.";
      return { found, text: t, speech: t };
    }
    const lab = (f) => labelFr(f.label).toLowerCase();
    if (found.length === 1) {
      const f = found[0];
      if (f.masked) { const t = `Votre ${lab(f)} est masqué sur la page.`; return { found, text: t, speech: t }; }
      return { found, text: `Votre ${lab(f)} est de ${f.raw}.`, speech: `Votre ${lab(f)} est de ${amountWords(f)}.` };
    }
    const w = found.map(f => f.masked ? `${labelFr(f.label)} : masqué` : `${labelFr(f.label)} : ${f.raw}`);
    const sp = found.map(f => f.masked ? `${labelFr(f.label)}, masqué.` : `${labelFr(f.label)}, ${amountWords(f)}.`);
    return { found, text: `J'ai trouvé ${found.length} soldes : ${w.join(' ; ')}.`, speech: `J'ai trouvé ${found.length} soldes. ${sp.join(' ')}` };
  }

  // ---------- 3. Voix (locale, française : pas de voix réseau) ----------
  function localFrenchVoice() {
    return new Promise((res) => {
      const pick = () => speechSynthesis.getVoices().find(v => v.localService && /^fr/i.test(v.lang)) || null;
      const v = pick();
      if (v) return res(v);
      const done = () => { speechSynthesis.removeEventListener('voiceschanged', done); res(pick()); };
      speechSynthesis.addEventListener('voiceschanged', done);
      setTimeout(done, 1200);
    });
  }
  async function speak(text) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const v = await localFrenchVoice();
    if (!v) return false;                       // pas de voix locale : la réponse reste écrite
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = 0.9;
    speechSynthesis.speak(u);
    return true;
  }

  // ---------- 4. Bulle écrite (hors du <body>, dans un shadow DOM : la page n'est pas touchée) ----------
  function toast(text) {
    document.getElementById('lena-balance-toast')?.remove();
    const host = document.createElement('div');
    host.id = 'lena-balance-toast';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    const root = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = '.b{position:fixed;left:16px;bottom:16px;max-width:min(420px,90vw);padding:14px 18px;' +
      'background:#111;color:#fff;border:2px solid #d4a017;border-radius:12px;' +
      'font:600 18px/1.4 system-ui,sans-serif;z-index:2147483647;box-shadow:0 4px 16px rgba(0,0,0,.4)}';
    const box = document.createElement('div');
    box.className = 'b';
    box.textContent = text;                     // textContent : jamais de HTML venant de la page
    root.append(style, box);
    document.documentElement.appendChild(host);
    setTimeout(() => host.remove(), CONFIG.TOAST_MS);
  }

  // ---------- 5. Action principale ----------
  let announced = false;
  async function read() {
    announced = true;
    const r = report();
    toast(r.text);                              // montant écrit EXACTEMENT comme affiché
    const spoken = await speak(r.speech);
    if (!spoken) toast(r.text + '  (Aucune voix française locale trouvée : lecture écrite seulement.)');
    document.dispatchEvent(new CustomEvent('lena:balance', { detail: { found: r.found, message: r.speech, spoken } }));
    return { ...r, spoken };
  }

  // Accès : Alt+Maj+S, événement 'lena:read-balance', ou Lena.balance.read()
  globalThis.Lena = globalThis.Lena || {};
  Lena.balance = { read, report, find: findBalances };
  document.addEventListener('lena:read-balance', () => read());
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyS') { e.preventDefault(); read(); }
  }, true);

  if (CONFIG.AUTO_ANNOUNCE) {
    const first = (e) => {
      if (announced) return;
      // un clic dans le panneau de Lena n'est pas « l'arrivée sur la page » : on ne déclenche pas
      if (e.composedPath && e.composedPath().some(n => n && n.id === 'lena-root')) return;
      if (e.type === 'keydown' && e.altKey) return;
      if (findBalances().length) read();
    };
    ['pointerdown', 'keydown'].forEach(t => window.addEventListener(t, first, { capture: true }));
  }
})();