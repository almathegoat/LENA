globalThis.Lena = globalThis.Lena || {};

Lena.ui = (() => {
  const T = Lena.translator, A = Lena.assistant;
  const api = globalThis.browser ?? globalThis.chrome;
  let sh, current = "", last = "", stats = { translated: 0 }, bannerClosed = false, listening = null, prevPad = null, tab = "vocal";
  const $ = (s) => sh.querySelector(s);

  // Icônes (tracés type Lucide, licence MIT)
  const P = {
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    swap: '<path d="m8 3-4 4 4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
    bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 16h.01"/><path d="M16 16h.01"/>',
    kbd: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    vol: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>'
  };
  const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n]}</svg>`;
  const chip = (icon, q) => `<button class="chip" type="button" data-q="${q}">${ic(icon)}<span>${q}</span></button>`;
  const form = (id, extra = "") => `
    <form class="saisie" data-form="${id}">
      <label class="field">${ic("kbd")}<input type="text" id="in-${id}" aria-label="Écrivez votre question" placeholder="Écrivez votre question…" autocomplete="off"></label>
      <button class="send" type="submit" aria-label="Envoyer">${ic("send")}</button>
    </form>`;

  const HTML = `
<div class="root">
  <div class="banner" id="banner" role="region" aria-label="Traduction de la page" hidden>
    <span><b>LENA</b> · <span id="bannerText"></span></span>
    <small class="grow">Prototype — traduction partielle, vocabulaire à valider</small>
    <button class="btn-ghost" id="toggleOrig" type="button">Afficher l'original</button>
    <button class="icon-btn" id="bannerClose" type="button" aria-label="Fermer le bandeau">×</button>
  </div>

  <button class="hint" id="hint" type="button" hidden>Passer à l'assistance vocale</button>
  <div class="dock" id="dock">
    <button class="fab" id="fab" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Ouvrir Lena, votre assistante">
      <img id="fabImg" alt=""><span class="badge">${ic("mic")}</span>
    </button>
    <button class="fab-x" id="fabX" type="button" aria-label="Masquer le bouton flottant">×</button>
  </div>

  <section class="panel" id="panel" role="dialog" aria-label="Lena, votre assistante intelligente" hidden>
    <div class="head">
      <img id="avatar" alt="">
      <div class="brand">
        <h2>Lena<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20 9 14M11 11l2-6M16 12l5-3"/></svg></h2>
        <p>Votre assistante intelligente</p>
      </div>
      <div class="wins">
        <button class="icon-btn" id="min" type="button" aria-label="Réduire Lena">–</button>
        <button class="icon-btn" id="close" type="button" aria-label="Fermer Lena">×</button>
      </div>
      <svg class="swoosh-h" viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 16C60 16 130 4 240 2" fill="none" stroke="#f5b82e" stroke-width="3"/></svg>
    </div>
    <div class="tabs" role="tablist" aria-label="Fonctions de Lena">
      <button class="tab" role="tab" id="t-vocal" aria-controls="p-vocal" aria-selected="true" type="button">${ic("chat")}Assistant vocal</button>
      <button class="tab" role="tab" id="t-trad" aria-controls="p-trad" aria-selected="false" tabindex="-1" type="button">${ic("globe")}Traduction de page</button>
      <button class="tab" role="tab" id="t-chat" aria-controls="p-chat" aria-selected="false" tabindex="-1" type="button">${ic("bot")}Chat intelligent</button>
    </div>

    <div class="body" role="tabpanel" id="p-vocal" aria-labelledby="t-vocal">
      <div class="log" id="log-vocal" role="log" aria-live="polite" aria-label="Conversation"></div>
      <p class="lbl">Suggestions rapides :</p>
      <div class="chips" role="group" aria-label="Suggestions rapides">
        ${chip("wallet", "Quel est mon solde ?")}${chip("swap", "Comment transférer ?")}${chip("info", "Explique cette page")}${chip("globe", "Traduire en duala")}
      </div>
      <div class="mic-row" id="micRow">
        <div class="wave l" id="waveL" aria-hidden="true"></div>
        <button class="mic" id="mic" type="button" aria-pressed="false" aria-label="Parler à Lena">${ic("mic")}</button>
        <div class="wave r" id="waveR" aria-hidden="true"></div>
      </div>
      <p class="mic-status" id="micStatus" role="status"></p>
      ${form("vocal")}
      <button class="cta sec" id="showDock" type="button" hidden>Réafficher le bouton flottant</button>
    </div>

    <div class="body" role="tabpanel" id="p-trad" aria-labelledby="t-trad" hidden>
      <fieldset>
        <legend>Langue de la page</legend>
        <label><input type="radio" name="lang" value="dua" checked> Duala</label>
        <label><input type="radio" name="lang" value="ewo"> Ewondo</label>
        <label><input type="radio" name="lang" value="ful"> Fulfulde</label>
      </fieldset>
      <button class="cta" id="doTrad" type="button">Traduire la page</button>
      <button class="cta sec" id="doOrig" type="button" hidden>Afficher l'original</button>
      <p class="note" id="tradStatus" role="status">La page est affichée en français.</p>
      <p class="note">Les montants, frais, totaux, numéros, références et noms ne sont jamais modifiés. Traduction partielle : les textes absents du dictionnaire restent en français.</p>
    </div>

    <div class="body" role="tabpanel" id="p-chat" aria-labelledby="t-chat" hidden>
      <div class="log" id="log-chat" role="log" aria-live="polite" aria-label="Conversation"></div>
      ${form("chat")}
    </div>
    <svg class="swoosh-f" viewBox="0 0 440 22" preserveAspectRatio="none" aria-hidden="true"><path d="M0 22C110 22 250 4 440 6V22z" fill="#0a1230"/><path d="M0 22C110 22 250 4 440 6" fill="none" stroke="#f5b82e" stroke-width="2.5"/></svg>
  </section>
</div>`;

  function build() {
    const host = document.createElement("div");
    host.id = "lena-root"; host.setAttribute("translate", "no"); host.setAttribute("data-lena-ignore", "");
    sh = host.attachShadow({ mode: "open" });
    sh.innerHTML = `<style>${Lena.CSS}</style>${HTML}`;
    $("#fabImg").src = Lena.AVATAR; $("#avatar").src = Lena.AVATAR;
    $("#waveL").innerHTML = [8, 14, 22, 32, 44].map(h => `<i style="height:${h}px"></i>`).join("");
    $("#waveR").innerHTML = [44, 32, 22, 14, 8].map(h => `<i style="height:${h}px"></i>`).join("");
    document.documentElement.appendChild(host);      // hors de <body> : pas de bruit pour l'observateur
    bind(); reset();
  }

  // ---------- Conversation ----------
  const logOf = () => $(tab === "chat" ? "#log-chat" : "#log-vocal");
  function status(text, warn) { const s = $("#micStatus"); s.textContent = text; s.classList.toggle("warn", !!warn); }
  function row(log, me) { const r = document.createElement("div"); r.className = "row" + (me ? " moi" : ""); log.appendChild(r); return r; }
  function addLena(log, lines, say) {
    const r = row(log, false), img = document.createElement("img"); img.src = Lena.AVATAR; img.alt = ""; r.appendChild(img);
    const b = document.createElement("div"); b.className = "bulle"; r.appendChild(b);
    const t = document.createElement("div"); (Array.isArray(lines) ? lines : [lines]).forEach(l => { const p = document.createElement("p"); p.textContent = l; t.appendChild(p); }); b.appendChild(t);
    if (say) {
      const s = document.createElement("button"); s.type = "button"; s.className = "say"; s.setAttribute("aria-label", "Écouter la réponse"); s.innerHTML = ic("vol");
      s.addEventListener("click", () => { if (!A.speak([].concat(lines).join(" "))) status("Lecture à voix haute indisponible : aucune voix française locale sur cet appareil.", true); });
      b.appendChild(s);
    }
    log.scrollTop = log.scrollHeight;
  }
  function addMe(log, text) {
    const r = row(log, true), b = document.createElement("div"); b.className = "bulle"; r.appendChild(b);
    const p = document.createElement("p"); p.textContent = text; b.appendChild(p);
    const u = document.createElement("span"); u.className = "user"; u.innerHTML = ic("user"); b.appendChild(u);
    log.scrollTop = log.scrollHeight;
  }
  const GREETING = ["Bonjour ! 👋", "Je suis LENA, votre assistante intelligente. Comment puis-je vous aider aujourd'hui ?"];
  function reset() {
    for (const id of ["#log-vocal", "#log-chat"]) { $(id).textContent = ""; addLena($(id), GREETING, false); }
    status(A.canListen() ? "Appuyez sur le micro pour parler (en français)." : "La dictée vocale n'est pas disponible dans ce navigateur (essayez Chrome ou Edge). Écrivez votre question ci-dessous.", !A.canListen());
  }
  function ask(text, { speak } = {}) {
    text = text.trim(); if (!text) return;
    const log = logOf(), a = A.answer(text);
    addMe(log, text); addLena(log, a.text, true);
    if (a.lang !== undefined) setLang(a.lang || null);
    if (speak && !A.speak(a.text)) status("Lecture à voix haute indisponible : la réponse est affichée.", true);
  }
  function toggleMic() {
    if (listening) { listening.stop(); return; }
    A.stopSpeaking();
    if (!A.canListen()) { status("La dictée vocale n'est pas disponible dans ce navigateur (essayez Chrome ou Edge). Écrivez votre question ci-dessous.", true); return; }
    $("#mic").setAttribute("aria-pressed", "true"); $("#micRow").classList.add("on"); status("Parlez maintenant…");
    listening = A.listen({
      onText: (t) => ask(t, { speak: true }),
      onEnd: () => { listening = null; $("#mic").setAttribute("aria-pressed", "false"); $("#micRow").classList.remove("on"); if ($("#micStatus").textContent === "Parlez maintenant…") status("Appuyez sur le micro pour parler (en français)."); },
      onError: (e) => status((e === "not-allowed" || e === "service-not-allowed") ? "Micro refusé : autorisez-le dans le navigateur, ou écrivez votre question." : e === "no-speech" ? "Je n'ai rien entendu. Réessayez ou écrivez votre question." : "Le micro a rencontré un problème. Écrivez votre question.", true)
    });
    if (!listening) { $("#mic").setAttribute("aria-pressed", "false"); $("#micRow").classList.remove("on"); }
  }

  // ---------- Panneau & onglets ----------
  const isOpen = () => !$("#panel").hidden;
  function notify(open) { try { Promise.resolve(api?.runtime?.sendMessage({ lena: "state", open })).catch(() => {}); } catch (e) {} }
  function openPanel(name) {
    $("#panel").hidden = false; $("#fab").setAttribute("aria-expanded", "true"); $("#hint").hidden = true;
    selectTab(name || tab, true); notify(true);
  }
  function hidePanel() {
    A.stopSpeaking(); listening?.stop?.();
    $("#panel").hidden = true; $("#fab").setAttribute("aria-expanded", "false"); refreshHint(); notify(false);
  }
  function selectTab(name, focus) {
    tab = name;
    for (const t of sh.querySelectorAll(".tab")) {
      const on = t.id === "t-" + name;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) t.focus();
    }
  }
  const refreshHint = () => { $("#hint").hidden = !(current && $("#panel").hidden && !$("#dock").hidden); };

  // ---------- Traduction ----------
  function setLang(code) {
    if (code) {
      T.setLanguage(code); current = last = code; bannerClosed = false;
      $("#bannerText").textContent = Lena.DICT[code].banner;
      const r = sh.querySelector(`input[name=lang][value=${code}]`); if (r) r.checked = true;
    } else { T.setLanguage(null); current = ""; }
    renderTrad();
  }
  function renderTrad() {
    const on = !!current;
    $("#doTrad").hidden = on; $("#doOrig").hidden = !on;
    $("#toggleOrig").textContent = on ? "Afficher l'original" : "Traduire à nouveau";
    $("#tradStatus").textContent = on ? `Page en ${Lena.DICT[current].label} — ${stats.translated} texte(s) traduit(s).` : "La page est affichée en français.";
    const showBanner = !!last && !bannerClosed;
    $("#banner").hidden = !showBanner; syncPadding(showBanner); refreshHint();
  }
  function syncPadding(show) {
    const el = document.documentElement, h = show ? $("#banner").offsetHeight : 0;
    if (show) { if (prevPad === null) prevPad = el.style.paddingTop; el.style.paddingTop = h + "px"; }
    else if (prevPad !== null) { el.style.paddingTop = prevPad; prevPad = null; }
    $(".root").style.setProperty("--bt", h + "px");
  }
  const selectedLang = () => sh.querySelector("input[name=lang]:checked").value;

  function bind() {
    $("#fab").addEventListener("click", () => (isOpen() ? hidePanel() : openPanel()));
    $("#min").addEventListener("click", () => { hidePanel(); $("#fab").focus(); });
    $("#close").addEventListener("click", () => { hidePanel(); reset(); $("#fab").focus(); });
    $("#hint").addEventListener("click", () => openPanel("vocal"));
    // La croix masque le bouton flottant (jusqu'au rechargement de la page) ; l'icône de la barre d'outils reste disponible.
    $("#fabX").addEventListener("click", () => { $("#dock").hidden = true; $("#hint").hidden = true; $("#showDock").hidden = false; });
    $("#showDock").addEventListener("click", () => { $("#dock").hidden = false; $("#showDock").hidden = true; refreshHint(); $("#fab").focus(); });
    $("#panel").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); hidePanel(); $("#fab").focus(); } });

    const tabs = [...sh.querySelectorAll(".tab")];
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => selectTab(t.id.slice(2), false));
      t.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length].id.slice(2), true); }
        if (e.key === "Home") { e.preventDefault(); selectTab("vocal", true); }
        if (e.key === "End") { e.preventDefault(); selectTab("chat", true); }
      });
    });

    sh.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => ask(c.dataset.q)));
    sh.querySelectorAll("form").forEach(f => f.addEventListener("submit", (e) => { e.preventDefault(); const i = f.querySelector("input"); ask(i.value); i.value = ""; }));
    $("#mic").addEventListener("click", toggleMic);

    $("#doTrad").addEventListener("click", () => setLang(selectedLang()));
    $("#doOrig").addEventListener("click", () => setLang(null));
    $("#toggleOrig").addEventListener("click", () => (current ? setLang(null) : setLang(last || "dua")));
    $("#bannerClose").addEventListener("click", () => { bannerClosed = true; renderTrad(); });
    T.onChange = (s) => { stats = s; renderTrad(); };
    if (globalThis.ResizeObserver) new ResizeObserver(() => { if (!$("#banner").hidden) syncPadding(true); }).observe($("#banner"));
  }

  return { build, openPanel, togglePanel: () => (isOpen() ? hidePanel() : openPanel()) };
})();
