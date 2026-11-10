// Icône dans la barre d'outils (comme IDM) : un clic ouvre/ferme Lena sur l'onglet actif.
// Aucune donnée n'est lue ni envoyée ici : on ne fait que relayer « ouvrir/fermer » et changer l'icône.
const api = globalThis.browser ?? globalThis.chrome;
const paths = (glow) => Object.fromEntries([16, 32, 48, 128].map(s => [s, `icons/tb${s}${glow ? "-glow" : ""}.png`]));

api.action.onClicked.addListener((tab) => {
  Promise.resolve(api.tabs.sendMessage(tab.id, { lena: "toggle" })).catch(() => {});   // page protégée (about:, chrome://) : rien à faire
});

// Le contenu signale ouvert/fermé : l'icône « s'allume » quand le panneau est ouvert.
api.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.lena === "state" && sender.tab?.id != null) api.action.setIcon({ tabId: sender.tab.id, path: paths(!!msg.open) });
});
