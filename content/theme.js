(() => {
  const host = document.getElementById("lena-root");
  const shadow = host && host.shadowRoot;
  const root = shadow && shadow.querySelector(".root");
  const controls = shadow && shadow.querySelector(".wins");

  if (!root || !controls) {
    console.error("Lena: impossible d'initialiser le thème, interface introuvable.");
    return;
  }

  const darkStyles = `
    .root.lena-dark {
      --fond: #0f172a;
      --texte: #e2e8f0;
      --doux: #cbd5e1;
      --trait: #475569;
      --focus: #7dd3fc;
      color-scheme: dark;
    }
    .root.lena-dark .fab-x,
    .root.lena-dark .hint,
    .root.lena-dark .hint::after,
    .root.lena-dark .bulle {
      background: #1e293b;
    }
    .root.lena-dark .fab-x,
    .root.lena-dark .hint {
      color: var(--texte);
    }
    .root.lena-dark .bulle {
      border-color: var(--trait);
    }
    .root.lena-dark .moi .bulle {
      background: rgba(20, 33, 74, 0.95);
      border-color: rgba(20, 33, 74, 0.95);
    }
    .root.lena-dark .user,
    .root.lena-dark .saisie .field,
    .root.lena-dark .chip,
    .root.lena-dark fieldset,
    .root.lena-dark .cta.sec {
      background: #1e293b;
      color: var(--texte);
    }
    .root.lena-dark .say:hover {
      background: #334155;
    }
    .root.lena-dark .say {
      color: #f8fafc;
    }
    .root.lena-dark .chip:hover {
      background: rgba(59, 130, 246, 0.12);
    }
    .root.lena-dark .theme-toggle {
      font-size: 19px;
    }
    .root.lena-dark .mic {
      background: linear-gradient(135deg, #183466, #091a2f);
    }
  `;
  const style = document.createElement("style");
  style.textContent = `${darkStyles}
    @media (prefers-color-scheme: dark) {
      ${darkStyles.replace(/\.root\.lena-dark/g, ".root:not(.lena-light)")}
    }
  `;
  shadow.appendChild(style);

  const toggle = document.createElement("button");
  toggle.className = "icon-btn theme-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-pressed", "false");
  controls.insertBefore(toggle, controls.firstChild);

  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  let mode = "system";
  let isDark = preference.matches;

  function applyTheme(dark) {
    isDark = dark;
    root.classList.toggle("lena-dark", mode === "dark");
    root.classList.toggle("lena-light", mode === "light");
    root.style.colorScheme = mode === "system" ? "light dark" : dark ? "dark" : "light";
    toggle.textContent = dark ? "☀" : "☾";
    toggle.setAttribute("aria-label", mode === "system"
      ? `Thème automatique actif : ${dark ? "sombre" : "clair"}. Cliquer pour forcer l'autre thème.`
      : "Revenir au thème de l'appareil");
    toggle.title = mode === "system" ? "Thème de l'appareil (automatique)" : "Revenir au thème de l'appareil";
    toggle.setAttribute("aria-pressed", String(mode !== "system"));
  }

  const syncFromSystem = () => {
    if (mode === "system") applyTheme(preference.matches);
  };

  toggle.addEventListener("click", () => {
    if (mode === "system") {
      mode = preference.matches ? "light" : "dark";
      applyTheme(mode === "dark");
      return;
    }
    mode = "system";
    syncFromSystem();
  });

  if (typeof preference.addEventListener === "function") {
    preference.addEventListener("change", syncFromSystem);
  } else if (typeof preference.addListener === "function") {
    preference.addListener(syncFromSystem);
  }

  syncFromSystem();
})();
