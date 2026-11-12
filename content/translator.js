// Traduction de page 100 % locale (dictionnaire embarqué, aucun appel réseau).
// Principe de sécurité : on ne remplace QUE des phrases connues du dictionnaire.
// Tout le reste (noms, montants, numéros, références) reste tel quel.
globalThis.Lena = globalThis.Lena || {};

Lena.translator = (() => {
  const P = Lena.protect;
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "CANVAS"]);          // sous-arbres ignorés
  const CONTROLS = new Set(["TEXTAREA", "INPUT", "SELECT", "OPTION"]);                        // saisies : texte/valeurs jamais touchés, attributs oui
  const ATTRS = ["placeholder", "title", "aria-label", "alt"];
  const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let lang = null, exact = new Map(), prefixes = [], observer = null, onChange = () => {};
  const texts = new Map();   // nœud texte -> { orig, written }
  const attrs = new Map();   // élément -> { attr: { orig, written } }
  const pending = new Set();
  let scheduled = false;
  const stats = { translated: 0, kept: 0, reverted: 0 };

  function buildIndex() {
    exact = new Map(); prefixes = [];
    const phrases = Lena.DICT[lang]?.phrases || {};
    for (const [k, e] of Object.entries(phrases)) {
      if (!(e.ok || Lena.CONFIG.ALLOW_UNVALIDATED) || !e.t) continue;   // terme non validé = ignoré en mode final
      if (e.prefix) prefixes.push([k, e]); else exact.set(norm(k), e);
    }
    prefixes.sort((a, b) => b[0].length - a[0].length);
  }

  // Retourne la traduction, ou null si rien à traduire / si l'intégrité n'est pas garantie.
  function translateString(str) {
    const core = str.trim();
    if (!core) return null;
    const lead = str.slice(0, str.indexOf(core)), trail = str.slice(str.indexOf(core) + core.length);
    const { masked, saved } = P.mask(core);
    let out = null, entry = null;

    entry = exact.get(norm(P.generalize(masked)));
    if (entry) {
      const vals = P.ordered(masked, saved); let i = 0;
      out = entry.t.replace(/\{n\}/g, () => vals[i++] ?? "");
    } else {
      for (const [k, e] of prefixes) {
        const m = masked.match(new RegExp("^" + esc(k) + "(?=[\\s,;:!.?]|$)", "i"));
        if (m) { entry = e; out = P.unmask(e.t + masked.slice(m[0].length), saved); break; }
      }
    }
    if (out == null) return null;
    if (entry.critical) out = `${out} (${core})`;                // action financière : on garde l'original visible
    if (!P.sameProtected(core, out)) { stats.reverted++; return null; }   // filet de sécurité
    return lead + out + trail;
  }

  const skippable = (el, forAttrs) => !el || el.closest?.(`[translate="no"],.notranslate,[contenteditable=""],[contenteditable="true"],[data-lena-ignore]`) || SKIP.has(el.tagName) || (!forAttrs && CONTROLS.has(el.tagName));

  function doText(node) {
    const rec = texts.get(node);
    if (rec && node.data === rec.written) return;                // c'est nous qui avons écrit ce texte
    const el = node.parentElement;
    if (skippable(el)) return;
    const orig = node.data, res = translateString(orig);
    if (res == null || res === orig) { stats.kept++; return; }
    texts.set(node, { orig, written: res }); node.data = res; stats.translated++;
  }

  function doAttrs(el) {
    if (skippable(el, true)) return;
    for (const a of ATTRS) {
      const cur = el.getAttribute?.(a);
      if (!cur) continue;
      const rec = attrs.get(el)?.[a];
      if (rec && cur === rec.written) continue;
      const res = translateString(cur);
      if (res == null || res === cur) continue;
      const m = attrs.get(el) || {}; m[a] = { orig: cur, written: res }; attrs.set(el, m);
      el.setAttribute(a, res); stats.translated++;
    }
  }

  function walk(root) {
    if (root.nodeType === Node.TEXT_NODE) return doText(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.id === "lena-root") return;                          // jamais traduire Lena elle-même
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: (n) => (n.nodeType === 1 && (n.id === "lena-root" || SKIP.has(n.tagName))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    for (let n = w.nextNode(); n; n = w.nextNode()) n.nodeType === 3 ? doText(n) : doAttrs(n);
  }

  function flush() {
    scheduled = false;
    if (!lang) return;
    for (const n of pending) if (n.isConnected) walk(n);
    pending.clear();
    for (const n of texts.keys()) if (!n.isConnected) texts.delete(n);
    observer?.takeRecords();                                      // ignore nos propres écritures
    onChange({ ...stats });
  }
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(flush); } };

  function onMutations(records) {
    for (const r of records) {
      if (r.type === "childList") r.addedNodes.forEach(n => pending.add(n));
      else if (r.type === "characterData") pending.add(r.target);
      else if (r.type === "attributes") pending.add(r.target);
    }
    schedule();
  }

  function restore() {
    for (const [n, r] of texts) if (n.isConnected && n.data === r.written) n.data = r.orig;
    for (const [el, m] of attrs) for (const a in m) if (el.getAttribute(a) === m[a].written) el.setAttribute(a, m[a].orig);
    texts.clear(); attrs.clear();
  }

  function setLanguage(code) {
    observer?.disconnect(); observer = null; restore();
    lang = null; stats.translated = stats.kept = stats.reverted = 0;
    if (code && Lena.DICT[code]) {
      lang = code; buildIndex();
      walk(document.body);
      observer = new MutationObserver(onMutations);
      observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
      observer.takeRecords();
    }
    onChange({ ...stats });
    return { ...stats };
  }

  function getTextLanguage(node) {
    const rec = texts.get(node);
    return rec && node.data === rec.written ? lang : null;
  }

  return { setLanguage, get lang() { return lang; }, set onChange(f) { onChange = f; }, translateString, getTextLanguage };
})();
