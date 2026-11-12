// Assistant Lena : réponses par règles (aucun serveur, aucun LLM) + voix du navigateur.
// Les données affichées sont lues localement pour répondre, jamais stockées ni envoyées.
// La réponse est écrite dans la langue de la question : français ou anglais.
// (Duala, ewondo et fulfulde : seulement avec des textes validés par des locuteurs, jamais inventés.)
globalThis.Lena = globalThis.Lena || {};

Lena.assistant = (() => {
  const strip = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();

  // ---- Détection de la langue de l'utilisateur : "fr" ou "en" (défaut : fr) ----
  const EN_WORDS = /\b(what|whats|how|where|when|why|can|could|please|my|the|is|are|am|i|you|me|your|balance|account|transfer|send|money|fees?|charges?|explain|this|page|screen|help|hello|hi|hey|thanks|thank|show|tell|do|does|need|want|translate|english|much|have|found|not|with|for|to|of|and|it|that|was|will|would|there|in|at|if|but|never|mind|just|about|which|who)\b/g;
  const FR_WORDS = /\b(quel|quelle|quels|quelles|mon|ma|mes|le|la|les|un|une|des|est|sont|je|tu|vous|votre|vos|moi|solde|compte|transfert|transferer|virement|envoyer|argent|frais|explique|expliquer|cette|ce|page|ecran|aide|aidez|bonjour|salut|bonsoir|merci|comment|ou|pourquoi|peux|puis|veux|voudrais|traduire|francais|anglais|pour|avec|dans|sur|et|de|du)\b/g;
  function langScores(text) {
    const q = strip(text || "");
    return { en: (q.match(EN_WORDS) || []).length, fr: (q.match(FR_WORDS) || []).length };
  }
  function detectLang(text) {
    if (detectDuala(text)) return "dua";
    const sc = langScores(text);
    return sc.en > sc.fr ? "en" : "fr";
  }
  const DUALA_REPEAT = "Na si sengi. Bino̱ le na lo teleye̱ mba ?";
  function detectDuala(text) {
    const q = ` ${strip(text || "")} `;
    const phrases = Object.values(Lena.DICT?.dua?.phrases || {})
      .map(entry => strip(entry.t || ""))
      .filter(phrase => phrase.length >= 6 && phrase.includes(" "));
    return phrases.some(phrase => q.includes(` ${phrase} `));
  }

  // ---- Textes de Lena, par langue ----
  const R = {
    fr: {
      nothing: "Je n'ai rien entendu. Pouvez-vous répéter ?",
      dua: "D'accord, je traduis la page en duala. La traduction est partielle.",
      ewo: "D'accord, je traduis la page en ewondo. La traduction est partielle.",
      ful: "D'accord, je traduis la page en fulfulde. La traduction est partielle.",
      orig: "Je réaffiche la page en français.",
      greet: "Bonjour ! Je suis Lena, votre assistante. Demandez-moi votre solde, comment transférer de l'argent, ou « Explique cette page ».",
      thanks: "Avec plaisir !",
      help: "Je peux lire votre solde, expliquer un transfert et les frais, résumer la page, et la traduire en duala, ewondo ou fulfulde (traduction partielle).",
      transfer: "Pour transférer de l'argent, choisissez « Effectuer un transfert », puis suivez les étapes : solde, frais, bénéficiaire, récapitulatif et confirmation. Avant de confirmer, vérifiez toujours le nom et le numéro du bénéficiaire.",
      fees: "Les frais sont calculés automatiquement et s'affichent avant la confirmation. Vérifiez-les dans le récapitulatif.",
      pin: "Ne partagez jamais votre code secret avec personne. Lena ne vous le demandera jamais.",
      pageOn: (t) => `Vous êtes sur la page « ${t || "sans titre"} ».`,
      pageHas: (h) => `Elle contient : ${h}.`,
      pageActs: (a) => `Actions disponibles : ${a}.`,
      unknown: "Je n'ai pas compris. Essayez : « Quel est mon solde ? », « Comment transférer ? », « Explique cette page » ou « Traduire en duala »."
    },
    en: {
      nothing: "I didn't hear anything. Could you repeat?",
      dua: "OK, I'm translating the page into Duala. The translation is partial.",
      ewo: "OK, I'm translating the page into Ewondo. The translation is partial.",
      ful: "OK, I'm translating the page into Fulfulde. The translation is partial.",
      orig: "I'm showing the page in its original language again.",
      greet: "Hello! I'm Lena, your assistant. Ask me for your balance, how to transfer money, or \"Explain this page\".",
      thanks: "You're welcome!",
      help: "I can read your balance, explain a transfer and its fees, summarize the page, and translate it into Duala, Ewondo or Fulfulde (partial translation).",
      transfer: "To transfer money, choose \"Effectuer un transfert\", then follow the steps: balance, fees, beneficiary, summary and confirmation. Before confirming, always check the beneficiary's name and number.",
      fees: "Fees are calculated automatically and shown before you confirm. Check them in the summary.",
      pin: "Never share your PIN or password with anyone. Lena will never ask you for it.",
      pageOn: (t) => `You are on the page "${t || "untitled"}".`,
      pageHas: (h) => `It contains: ${h}.`,
      pageActs: (a) => `Available actions: ${a}.`,
      unknown: "I didn't understand. Try: \"What is my balance?\", \"How do I transfer money?\", \"Explain this page\" or \"Translate to Duala\"."
    }
  };

  function summarizePage(T) {
    const heads = [...document.querySelectorAll("h1,h2,h3")].filter(h => h.offsetParent).map(h => h.textContent.trim()).filter(Boolean).slice(0, 4);
    const acts = [...document.querySelectorAll("button,[role=button],a.btn")].filter(b => b.offsetParent && b.id !== "lena-root").map(b => b.textContent.trim()).filter(x => x && x.length < 40).slice(0, 4);
    const parts = [T.pageOn(document.title)];
    if (heads.length) parts.push(T.pageHas(heads.join(", ")));
    if (acts.length) parts.push(T.pageActs(acts.join(", ")));
    return parts.join(" ");
  }

  // Retourne { text, speak?, lang?, speakLang }
  //   lang      : "dua" | "ewo" | "ful" | "" (changement de traduction de la page, comme avant)
  //   speakLang : "fr" | "en" (langue de la réponse, pour choisir la voix)
  function answer(question) {
    const q = strip(question);
    const L = detectLang(question);
    if (L === "dua") return { text: DUALA_REPEAT, speakLang: "dua" };
    const T = R[L];
    const out = (o) => ({ speakLang: L, ...o });
    if (!q) return out({ text: T.nothing });

    // Traduction de la page
    const wantsTranslate = /(traduc|translat|langue|language|\ben\b|\bto\b|\binto\b)/.test(q);
    if (/\b(duala|douala)\b/.test(q) && wantsTranslate) return out({ lang: "dua", text: T.dua });
    if (/ewondo/.test(q)) return out({ lang: "ewo", text: T.ewo });
    if (/(fulfulde|peul|foulfoulde)/.test(q)) return out({ lang: "ful", text: T.ful });
    if (/(francais|french|original)/.test(q) && /(page|traduc|translat|retour|back|revenir|affich|show|display)/.test(q)) return out({ lang: "", text: T.orig });

    // Solde : lu par content/balance.js (montant écrit exact + montant en toutes lettres pour la voix)
    if (/\b(solde|balance)\b|how much (money )?(do i have|is in)/.test(q)) {
      const r = Lena.balance ? Lena.balance.report(L) : null;
      return r ? out({ text: r.text, speak: r.speech }) : out({ text: L === "en" ? "I can't find your balance on this page." : "Je ne trouve pas votre solde sur cette page." });
    }
    if (/(transf|virement|envoy|send)/.test(q)) return out({ text: T.transfer });
    if (/(frais|\bfees?\b|\bcharges?\b)/.test(q)) return out({ text: T.fees });
    if (/(code secret|mot de passe|\bpin\b|password)/.test(q)) return out({ text: T.pin });
    if (/(explique|page|ecran|ou suis|explain|screen|where am i)/.test(q)) return out({ text: summarizePage(T) });
    if (/(\baide\b|\baidez\b|\bhelp\b|que peux|what can you)/.test(q)) return out({ text: T.help });
    if (/^(bonjour|salut|bonsoir|hello|hi|hey)\b/.test(q)) return out({ text: T.greet });
    if (/\b(merci|thanks?|thank you)\b/.test(q)) return out({ text: T.thanks });
    return out({ text: T.unknown });
  }

  // ---- Onglet « Chat intelligent » : fonction pas encore disponible ----
  // Réponse écrite dans la langue de l'utilisateur. Duala / bulu / ewondo / fulfulde : textes de dict/chat.js,
  // écrits par des locuteurs natifs. Sans texte validé, Lena répond en français (jamais une traduction inventée).
  const NOT_AVAILABLE = {
    fr: "Cette fonction n'est pas encore disponible sur cette version.",
    en: "This feature is not available yet in this version."
  };
  const DRAFT_NOTE = "⚠ Traduction à vérifier";
  const packs = () => (Lena.chatPacks && typeof Lena.chatPacks === "object") ? Lena.chatPacks : {};
  const isPack = (k) => k !== "allowDraft" && packs()[k] && typeof packs()[k] === "object";
  const entryOk = (e) => !!(e && typeof e.t === "string" && e.t.trim() && (e.ok || packs().allowDraft === true));

  function detectNational(q) {
    const words = ` ${q} `;
    let best = null, score = 0;
    for (const code of Object.keys(packs()).filter(isPack)) {
      const n = (packs()[code].triggers || []).filter(w => { const x = strip(w); return x && words.includes(` ${x} `); }).length;
      if (n > score) { score = n; best = code; }
    }
    return best;
  }

  // ctx.pageLang : langue choisie dans « Traduction de page » (dua | ewo | ful), utilisée seulement si
  // la question ne contient aucun mot français ou anglais reconnu.
  function chatReply(question, ctx = {}) {
    const q = strip(question);
    if (detectDuala(question)) return { lines: [DUALA_REPEAT], lang: "dua", canSpeak: true, speakLang: "dua" };
    const sc = langScores(question);
    let code = detectNational(q);
    if (!code && ctx.pageLang && !sc.en && !sc.fr && isPack(ctx.pageLang)) code = ctx.pageLang;
    if (code) {
      const e = packs()[code].replies && packs()[code].replies.notAvailable;
      if (entryOk(e)) return { lines: e.ok ? [e.t] : [e.t, DRAFT_NOTE], lang: code, canSpeak: false, speakLang: code };
      return { lines: [NOT_AVAILABLE.fr], lang: "fr", canSpeak: true, fallbackFrom: code };   // cascade : texte d'origine
    }
    const L = sc.en > sc.fr ? "en" : "fr";
    return { lines: [NOT_AVAILABLE[L]], lang: L, canSpeak: true, speakLang: L };
  }

  // ---- Voix ----
  // Reconnaissance : l'API du navigateur (Chrome) envoie l'audio à un service distant — à déclarer.
  // Aucune langue camerounaise n'est reconnue : la dictée se fait en français.
  const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  const canListen = () => !!SR;
  function listen({ onText, onEnd, onError }) {
    if (!SR) return null;
    const r = new SR();
    r.lang = "fr-FR"; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e) => onText(e.results[0][0].transcript);
    r.onerror = (e) => onError(e.error);
    r.onend = onEnd;
    try { r.start(); } catch (e) { onError("start"); return null; }
    return r;
  }

  // Synthèse : uniquement les voix locales (les voix « réseau » enverraient le texte à un serveur).
  // Chrome charge les voix en différé : getVoices() est vide au premier appel, d'où l'écoute de « voiceschanged ».
  let voices = [];
  const loadVoices = () => { voices = speechSynthesis.getVoices(); };
  if ("speechSynthesis" in globalThis) {
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }
  const localVoice = (lang) => {
    if (typeof lang !== "string" || !lang.trim()) return null;
    if ("speechSynthesis" in globalThis) voices = speechSynthesis.getVoices();
    const base = lang.trim().toLowerCase().split("-")[0];
    return voices.find(v => v.localService && v.lang?.toLowerCase().split("-")[0] === base);
  };
  let pageReadingId = 0;
  const canSpeakLang = (lang) => !!localVoice(lang);
  function canSpeak() { return "speechSynthesis" in globalThis && !!(localVoice("fr") || localVoice("en")); }
  // La langue de la voix suit la langue du texte lu (fr par défaut, en si le texte est en anglais).
  function speak(text, lang) {
    pageReadingId++;
    const L = lang || detectLang(text);
    const v = localVoice(L);
    if (!v) return false;                       // pas de voix locale dans cette langue : réponse écrite seulement
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v;
    u.lang = v.lang;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    return true;
  }
  function speakPage(segments, { onEnd, onError } = {}) {
    if (!("speechSynthesis" in globalThis)) return false;
    const chunks = [];
    for (const segment of segments) {
      const voice = localVoice(segment.lang);
      if (!voice) return false;
      for (const sentence of segment.text.match(/[^.!?…]+[.!?…]*/g) || [segment.text]) {
        for (const word of sentence.trim().split(/\s+/)) {
          if (!word) continue;
          const last = chunks[chunks.length - 1];
          if (last?.lang === segment.lang && last.text.length + word.length + 1 <= 180) last.text += " " + word;
          else chunks.push({ text: word, lang: segment.lang, voice });
        }
      }
    }
    if (!chunks.length) return false;

    const id = ++pageReadingId;
    speechSynthesis.cancel();
    let index = 0;
    const next = () => {
      if (id !== pageReadingId) return;
      if (index === chunks.length) { onEnd?.(); return; }
      try {
        const chunk = chunks[index++];
        const u = new SpeechSynthesisUtterance(chunk.text);
        u.voice = chunk.voice; u.lang = chunk.voice.lang;
        u.onend = next;
        u.onerror = () => { if (id === pageReadingId) { pageReadingId++; onError?.(); } };
        speechSynthesis.speak(u);
      } catch (e) {
        if (id === pageReadingId) { pageReadingId++; onError?.(e); }
      }
    };
    next();
    return true;
  }
  const stopSpeaking = () => { pageReadingId++; if ("speechSynthesis" in globalThis) speechSynthesis.cancel(); };

  return { answer, chatReply, detectLang, canListen, listen, canSpeak, canSpeakLang, speak, speakPage, stopSpeaking };
})();