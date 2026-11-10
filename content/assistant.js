// Assistant Lena : réponses par règles (aucun serveur, aucun LLM) + voix du navigateur.
// Les données affichées sont lues localement pour répondre, jamais stockées ni envoyées.
globalThis.Lena = globalThis.Lena || {};

Lena.assistant = (() => {
  const strip = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  const AMOUNT = /[+\-−]?\d[\d\s.,\u00a0\u202f]*\s?(?:FCFA|XAF|F\s?CFA)/i;
  const visibleText = () => document.body.innerText ?? document.body.textContent ?? "";

  function readBalance() {
    const t = visibleText(), i = t.search(/solde/i);
    if (i < 0) return null;
    const m = t.slice(i, i + 160).match(AMOUNT);
    return m ? m[0].trim() : null;
  }

  function summarizePage() {
    const heads = [...document.querySelectorAll("h1,h2,h3")].filter(h => h.offsetParent).map(h => h.textContent.trim()).filter(Boolean).slice(0, 4);
    const acts = [...document.querySelectorAll("button,[role=button],a.btn")].filter(b => b.offsetParent && b.id !== "lena-root").map(b => b.textContent.trim()).filter(x => x && x.length < 40).slice(0, 4);
    const parts = [`Vous êtes sur la page « ${document.title || "sans titre"} ».`];
    if (heads.length) parts.push(`Elle contient : ${heads.join(", ")}.`);
    if (acts.length) parts.push(`Actions disponibles : ${acts.join(", ")}.`);
    return parts.join(" ");
  }

  // Retourne { text, speak?, lang? }  (lang: "dua" | "ewo" | "ful" | "" pour revenir au français)
  function answer(question) {
    const q = strip(question);
    if (!q) return { text: "Je n'ai rien entendu. Pouvez-vous répéter ?" };

    if (/\b(duala|douala)\b/.test(q) && /(traduc|en |langue)/.test(q)) return { lang: "dua", text: "D'accord, je traduis la page en duala. La traduction est partielle." };
    if (/ewondo/.test(q)) return { lang: "ewo", text: "D'accord, je traduis la page en ewondo. La traduction est partielle." };
    if (/(fulfulde|peul|foulfoulde)/.test(q)) return { lang: "ful", text: "D'accord, je traduis la page en fulfulde. La traduction est partielle." };
    if (/(francais|original)/.test(q)) return { lang: "", text: "Je réaffiche la page en français." };

    if (/solde/.test(q)) {
      const b = readBalance();
      return b ? { text: `Votre solde disponible est de ${b}.` } : { text: "Je ne trouve pas votre solde sur cette page." };
    }
    if (/transf/.test(q)) return { text: "Pour transférer de l'argent, choisissez « Effectuer un transfert », puis suivez les étapes : solde, frais, bénéficiaire, récapitulatif et confirmation. Avant de confirmer, vérifiez toujours le nom et le numéro du bénéficiaire." };
    if (/frais/.test(q)) return { text: "Les frais sont calculés automatiquement et s'affichent avant la confirmation. Vérifiez-les dans le récapitulatif." };
    if (/(explique|page|ecran|ou suis)/.test(q)) return { text: summarizePage() };
    return { text: "Je n'ai pas compris. Essayez : « Quel est mon solde ? », « Comment transférer ? », « Explique cette page » ou « Traduire en duala »." };
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
  function canSpeak() {
    return "speechSynthesis" in globalThis && speechSynthesis.getVoices().some(v => v.localService && v.lang.toLowerCase().startsWith("fr"));
  }
  function speak(text) {
    if (!canSpeak()) return false;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = speechSynthesis.getVoices().find(v => v.localService && v.lang.toLowerCase().startsWith("fr"));
    u.lang = "fr-FR";
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    return true;
  }
  const stopSpeaking = () => { if ("speechSynthesis" in globalThis) speechSynthesis.cancel(); };

  return { answer, canListen, listen, canSpeak, speak, stopSpeaking };
})();
