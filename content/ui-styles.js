globalThis.Lena = globalThis.Lena || {};
Lena.CSS = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }
.root {
  --nuit: #0a1230; --nuit-2: #14214a; --or: #f5b82e; --or-fonce: #c98a10; --bt: 0px;
  --fond: #f4f7ff; --texte: #0d1530; --doux: #4a5578; --trait: #b9c5e6; --focus: #00bfff;
  font: 15px/1.45 Inter, "Segoe UI", Roboto, system-ui, -apple-system, sans-serif; color: var(--texte);
}
button, input { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
[hidden] { display: none !important; }
svg.i { width: 1.25em; height: 1.25em; flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- Bandeau ---------- */
.banner { position: fixed; inset: 0 0 auto 0; z-index: 2147483646; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  min-height: 48px; padding: 8px 16px; background: linear-gradient(115deg, rgba(10,18,48,.94), rgba(20,33,74,.86)); color: #fff;
  border-bottom: 1px solid rgba(245,184,46,.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.banner b { color: var(--or); }
.banner .grow { flex: 1; min-width: 160px; }
.banner small { color: #cfd8f5; }
.btn-ghost { background: rgba(255,255,255,.04); color: #fff; border: 1px solid rgba(255,255,255,.55); border-radius: 999px; padding: 7px 15px;
  transition: background .18s ease, border-color .18s ease, transform .18s ease; }
.btn-ghost:hover { background: rgba(255,255,255,.12); border-color: var(--or); transform: translateY(-1px); }
.icon-btn { background: transparent; border: 0; color: inherit; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1; }
.icon-btn:hover { background: rgba(255,255,255,.16); }

/* ---------- Bouton flottant (repos, survol/toucher = halo + rayons) ---------- */
.dock { position: fixed; right: 20px; bottom: 20px; z-index: 2147483645; width: 64px; height: 64px; }
.fab-x { position: absolute; top: -8px; right: -8px; z-index: 2; width: 24px; height: 24px; padding: 0; border-radius: 50%; display: grid; place-items: center;
  background: #fff; color: var(--nuit); border: 1px solid var(--trait); font-size: 16px; line-height: 1; box-shadow: 0 2px 6px rgba(0,0,0,.3); }
.fab-x:hover { background: var(--or); border-color: var(--or); }
.fab { position: relative; width: 64px; height: 64px; padding: 0; border: 0; border-radius: 50%;
  background: transparent; transition: transform .18s ease, box-shadow .18s ease; box-shadow: 0 4px 14px rgba(0,0,0,.4); }
.fab img { position: relative; width: 100%; height: 100%; display: block; border-radius: 50%; border: 3px solid var(--or); background: #fff; }
.fab::before { content: ""; position: absolute; inset: -18px; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(.8); transition: opacity .2s, transform .25s;
  background: repeating-conic-gradient(from 0deg, var(--or) 0 4deg, transparent 4deg 22.5deg);
  -webkit-mask-image: radial-gradient(circle, transparent 0 58%, #000 60% 76%, transparent 78%); mask-image: radial-gradient(circle, transparent 0 58%, #000 60% 76%, transparent 78%); }
.fab:hover, .fab:focus-visible, .fab:active, .fab[aria-expanded="true"] {
  transform: scale(1.07); box-shadow: 0 0 0 4px rgba(245,184,46,.35), 0 0 26px 10px rgba(245,184,46,.7); }
.fab:hover::before, .fab:focus-visible::before, .fab:active::before, .fab[aria-expanded="true"]::before { opacity: 1; transform: scale(1); }
.fab:active { transform: scale(.97); }
.badge { position: absolute; right: -4px; bottom: -2px; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nuit); color: var(--or); border: 2px solid var(--or); }
.badge svg.i { width: 14px; height: 14px; }
.hint { position: fixed; right: 20px; bottom: 100px; z-index: 2147483645; background: #fff; color: var(--texte); border: 1px solid var(--trait);
  border-radius: 10px; padding: 8px 12px; box-shadow: 0 4px 14px rgba(0,0,0,.25); }
.hint::after { content: ""; position: absolute; right: 26px; bottom: -7px; width: 12px; height: 12px; background: #fff;
  border-right: 1px solid var(--trait); border-bottom: 1px solid var(--trait); transform: rotate(45deg); }

/* ---------- Panneau ---------- */
.panel { position: fixed; top: calc(var(--bt) + 12px); right: 12px; z-index: 2147483647; width: min(440px, calc(100vw - 24px)); max-height: calc(100vh - var(--bt) - 24px);
  display: flex; flex-direction: column; border-radius: 24px; overflow: hidden; background: var(--fond);
  border: 2px solid var(--or); box-shadow: 0 18px 50px rgba(0,0,0,.55); }
.head { position: relative; display: flex; align-items: center; gap: 14px; padding: 16px 14px 14px; background: linear-gradient(160deg, var(--nuit), var(--nuit-2)); color: #fff; }
.head > img { width: 68px; height: 68px; border-radius: 50%; border: 3px solid var(--or); background: #fff; flex: none; }
.brand { flex: 1; min-width: 0; }
.brand h2 { margin: 0; font-size: 36px; line-height: 1; font-weight: 800; letter-spacing: .5px; display: flex; align-items: flex-start; gap: 2px; }
.brand h2 svg { width: 22px; height: 22px; stroke: var(--or); stroke-width: 3; fill: none; stroke-linecap: round; margin-top: -2px; }
.brand p { margin: 4px 0 0; color: #e3e9ff; font-size: 14px; }
.wins { align-self: flex-start; display: flex; gap: 2px; }
.swoosh-h { position: absolute; right: 0; bottom: 0; width: 55%; height: 16px; pointer-events: none; }
.tabs { display: flex; gap: 6px; padding: 10px 10px 12px; background: var(--nuit-2); }
.tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; border: 1px solid #5d6fae; background: transparent;
  color: #fff; border-radius: 999px; padding: 9px 8px; font-size: 13px; min-height: 44px; }
.tab svg.i { width: 18px; height: 18px; }
.tab:hover { border-color: var(--or); }
.tab[aria-selected="true"] { background: var(--or); color: var(--nuit); border-color: var(--or); font-weight: 700; }
.body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 14px 14px 22px; display: flex; flex-direction: column; gap: 12px; }
.lbl { margin: 0; font-weight: 600; }

/* Conversation */
.log { display: flex; flex-direction: column; gap: 12px; max-height: 240px; overflow-y: auto; padding: 2px 8px 8px;
  scrollbar-width: thin; scrollbar-color: rgba(74,85,120,.4) transparent; }
.log::-webkit-scrollbar { width: 5px; }
.log::-webkit-scrollbar-track { background: transparent; }
.log::-webkit-scrollbar-thumb { background: rgba(74,85,120,.4); border-radius: 999px; }
.row { display: flex; gap: 10px; align-items: flex-start; }
.row.moi { justify-content: flex-end; }
.row > img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--or); background: #fff; flex: none; }
.bulle { background: #f0f4ff; border: 1px solid var(--trait); border-radius: 16px; padding: 10px 14px; max-width: 86%; display: flex; gap: 8px; align-items: flex-start; }
.bulle p { margin: 0; }
.moi .bulle { background: var(--nuit-2); color: #fff; border-color: var(--nuit-2); border-radius: 16px 16px 4px 16px; }
.user { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #fff; color: var(--nuit); flex: none; }
.user svg.i { width: 15px; height: 15px; }
.say { border: 0; background: transparent; color: var(--nuit); border-radius: 8px; padding: 4px; margin: -2px -6px 0 0; }
.say:hover { background: #e6ecff; }

/* Suggestions */
.quick-suggestions { display: grid; gap: 8px; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; scrollbar-width: thin; scrollbar-color: rgba(74,85,120,.35) transparent; }
.chips::-webkit-scrollbar { height: 4px; }
.chips::-webkit-scrollbar-track { background: transparent; }
.chips::-webkit-scrollbar-thumb { background: rgba(74,85,120,.35); border-radius: 999px; }
.chip { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--trait); border-radius: 999px;
  padding: 8px 12px; min-height: 44px; text-align: left; font-size: 14px; white-space: nowrap; }
.chip svg.i { color: var(--nuit-2); }
.chip:hover { border-color: var(--or-fonce); background: #fffaf0; }

/* Micro */
.mic-row { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 6px 0 0; }
.wave { display: flex; align-items: center; gap: 4px; height: 56px; flex: 1; }
.wave.l { justify-content: flex-end; } .wave.r { justify-content: flex-start; }
.wave i { display: block; width: 4px; border-radius: 2px; background: var(--or); }
.mic { position: relative; isolation: isolate; width: 78px; height: 78px; flex: none; border-radius: 50%; border: 2px solid rgba(245,184,46,.7);
  display: grid; place-items: center; color: var(--or); background: linear-gradient(135deg, #20396a, var(--nuit));
  box-shadow: 0 0 0 10px rgba(245,184,46,.12), 0 18px 28px rgba(8,19,43,.28); transition: transform .15s ease, box-shadow .15s ease; }
.mic::before { content: ""; position: absolute; inset: -12px; border-radius: 50%; z-index: -1; border: 2px solid rgba(245,184,46,.38);
  animation: mic-pulse 2.4s ease-out infinite; pointer-events: none; }
.mic[aria-pressed="true"]::before { animation: none; opacity: 0; }
.mic svg.i { width: 34px; height: 34px; }
.mic:hover { transform: scale(1.03); }
.mic[aria-pressed="true"] { box-shadow: 0 0 0 12px rgba(245,184,46,.18), 0 0 0 20px rgba(245,184,46,.14), 0 18px 28px rgba(8,19,43,.3); }
.mic-row.on .wave i { animation: onde .9s ease-in-out infinite alternate; }
.mic-row.on .wave i:nth-child(odd) { animation-delay: .25s; }
@keyframes onde { to { transform: scaleY(.45); } }
@keyframes mic-pulse {
  0% { opacity: .75; transform: scale(.9); }
  75%, 100% { opacity: 0; transform: scale(1.22); }
}
.mic-status { margin: 0; text-align: center; font-weight: 600; font-size: 14px; }
.mic-status.warn { font-weight: 400; color: var(--doux); font-size: 13px; }
.page-reader { display: grid; gap: 8px; }
.note.warn { color: #8a4b00; font-weight: 600; }

/* Saisie */
.saisie { display: flex; align-items: center; gap: 8px; }
.saisie .field { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; border: 1px solid var(--trait); border-radius: 999px; padding: 0 14px; background: #fff; min-height: 46px; color: var(--doux); }
.saisie input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; padding: 10px 0; color: var(--texte); }
.saisie .field:focus-within { outline: 3px solid var(--focus); outline-offset: 1px; }
.send { width: 46px; height: 46px; border-radius: 50%; border: 0; display: grid; place-items: center; background: var(--nuit); color: #fff; flex: none; }
.send:hover { background: var(--nuit-2); }

/* Traduction */
.cta { border: 0; border-radius: 999px; padding: 12px 18px; background: var(--or); color: var(--nuit); font-weight: 700; min-height: 46px; }
.cta.sec { background: #fff; border: 1px solid var(--nuit); font-weight: 600; }
fieldset { border: 1px solid var(--trait); border-radius: 14px; margin: 0; padding: 8px 12px; background: #fff; }
legend { padding: 0 6px; font-weight: 600; }
fieldset label { display: flex; align-items: center; gap: 8px; min-height: 38px; }
.note { margin: 0; color: var(--doux); font-size: 13px; }

.swoosh-f { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 22px; pointer-events: none; }

@media (prefers-reduced-motion: reduce) { .fab, .fab::before, .mic, .btn-ghost { transition: none; } .mic::before, .wave i { animation: none !important; } }
@media (forced-colors: active) { .tab[aria-selected="true"] { outline: 2px solid; } }
`;
