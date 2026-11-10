// Protection des valeurs financières : montants, numéros de compte/téléphone,
// références, dates, nombres. Ces éléments sont masqués avant toute substitution,
// remis tels quels après, et on vérifie qu'aucun n'a changé.
globalThis.Lena = globalThis.Lena || {};

Lena.protect = (() => {
  const PATTERNS = [
    /\+?\d[\d\s.\-()\u00a0\u202f]{6,}\d/g,                                  // téléphones, numéros de compte
    /\b[A-Z]{2,}[\s\-]?\d[\w\-]{2,}\b/g,                                    // références (CM 001..., TRX-2026-0042)
    /[+\-−]?\d[\d\s.,\u00a0\u202f]*\s?(?:FCFA|XAF|XOF|F\s?CFA|€|\$|%)/gi,   // montants avec devise
    /\b\d{1,2}\s(?:janv|févr|fevr|mars|avr|mai|juin|juil|août|aout|sept|oct|nov|déc|dec)\.?\s\d{4}\b/gi, // dates
    /[+\-−]?\d[\d.,]*/g                                                      // tout autre nombre
  ];
  const TOKEN = /\u27e6([a-z]+)\u27e7/g;
  // Index → lettres (sans chiffres, pour ne pas être re-capturé par les motifs numériques)
  const enc = (n) => { let s = ""; do { s = String.fromCharCode(97 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0); return s; };
  const dec = (s) => [...s].reduce((n, c) => n * 26 + (c.charCodeAt(0) - 96), 0) - 1;

  function mask(text) {
    const saved = [];
    let out = text;
    for (const re of PATTERNS) {
      out = out.replace(re, (m) => { saved.push(m); return `\u27e6${enc(saved.length - 1)}\u27e7`; });
    }
    return { masked: out, saved };
  }

  function unmask(masked, saved) {
    return masked.replace(TOKEN, (_, c) => saved[dec(c)] ?? "");
  }

  // Les valeurs protégées doivent être strictement identiques avant/après.
  function sameProtected(before, after) {
    const a = mask(before).saved.map(s => s.replace(/\s+/g, "")).sort().join("|");
    const b = mask(after).saved.map(s => s.replace(/\s+/g, "")).sort().join("|");
    return a === b;
  }

  // Remplace chaque valeur protégée par {n} (clé de recherche du dictionnaire)
  const generalize = (masked) => masked.replace(TOKEN, "{n}");
  // Valeurs protégées dans l'ordre d'apparition dans le texte
  const ordered = (masked, saved) => [...masked.matchAll(TOKEN)].map(m => saved[dec(m[1])]);

  return { mask, unmask, sameProtected, generalize, ordered };
})();
