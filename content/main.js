// Point d'entrée : configuration + montage de l'interface Lena.
(() => {
  if (document.getElementById("lena-root")) return;          // évite une double injection
  globalThis.Lena = globalThis.Lena || {};

  Lena.CONFIG = {
    // true  = les termes « ok: false » du dictionnaire sont utilisés (développement / démo)
    // false = SEULS les termes validés (ok: true) sont utilisés  ← à mettre avant la remise finale
    ALLOW_UNVALIDATED: true
  };

  const start = () => {
    Lena.ui.build();
    // Clic sur l'icône de la barre d'outils (relayé par background.js)
    const api = globalThis.browser ?? globalThis.chrome;
    api?.runtime?.onMessage?.addListener((msg) => { if (msg?.lena === "toggle") Lena.ui.togglePanel(); });
    // Alt + Maj + L : ouvrir / fermer Lena au clavier
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.shiftKey && e.code === "KeyL") { e.preventDefault(); Lena.ui.togglePanel(); }
    });
  };
  document.body ? start() : document.addEventListener("DOMContentLoaded", start);
})();
