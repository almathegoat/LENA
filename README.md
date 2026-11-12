# Lena — extension Chrome (prototype SAFINUM Innovate 2026)

Assistante vocale + traduction de page en langues camerounaises. Squelette front-end, sans serveur.

## Installer
1. Chrome → `chrome://extensions` → activer **Mode développeur**.
2. **Charger l'extension non empaquetée** → choisir ce dossier (celui qui contient `manifest.json`).
3. **Épingler** l'icône de Lena dans la barre d'outils (puzzle 🧩 → épingle). Ouvrir `test/test-page.html` (ou l'environnement de test), puis **cliquer sur l'icône de Lena** : le panneau s'ouvre en haut à droite, comme IDM. L'icône s'allume tant que le panneau est ouvert.
   Autres accès : bouton rond avec micro doré en bas à droite (la petite **×** le masque jusqu'au rechargement de la page ; « Réafficher le bouton flottant » est dans l'onglet Assistant vocal), ou **Alt + Maj + L**. Dans l'onglet Traduction, choisissez **Duala** pour traduire les expressions françaises ou anglaises présentes dans le dictionnaire. Dans l'onglet Assistant vocal, « Lire toute la page » lit le texte visible avec une voix locale ; « Arrêter la lecture » interrompt la lecture.
   ⚠ Recharger les pages déjà ouvertes après avoir installé ou rechargé l'extension.
4. Après chaque modification du code : bouton ↻ sur la carte de l'extension, puis recharger la page.

## Structure
| Fichier | Rôle |
|---|---|
| `dict/duala.js`, `ewondo.js`, `fulfulde.js` | Dictionnaires embarqués ; le Duala accepte des entrées source françaises et anglaises, et les traductions restent partielles |
| `content/protect.js` | Masque montants, numéros, références, dates avant traduction et vérifie qu'ils n'ont pas changé |
| `content/translator.js` | Traduction du DOM + `MutationObserver` (contenu injecté après chargement) + retour à l'original |
| `content/assistant.js` | Réponses de Lena (règles locales), micro et lecture à voix haute |
| `content/ui.js`, `ui-styles.js` | Panneau, onglets, bandeau, bouton flottant |
| `content/theme.js` | Thème automatique selon l'appareil, avec dérogation temporaire dans le panneau |
| `content/main.js` | Configuration (`ALLOW_UNVALIDATED`), écoute du clic sur l'icône |
| `background.js` | Icône de la barre d'outils : relaie « ouvrir/fermer » et allume l'icône |

## Remplir un dictionnaire
```js
"Effectuer un transfert": { t: "…", ok: false, critical: true },
"Frais : {n}":            { t: "… {n}", ok: false },      // {n} = valeur protégée (montant, numéro…)
"Bonjour":                { t: "…", ok: false, prefix: true } // traduit seulement le début : « Bonjour, Amina »
```
- Clé = texte français ou anglais **exact** affiché sur la page (pour Duala). Correspondance sur le texte entier (pas de remplacement de mots isolés, pour éviter les contresens : « Non disponible » ne devient jamais « Dé disponible »).
- `ok: true` seulement après validation par un locuteur.
- `critical: true` pour envoyer / confirmer / annuler / transfert : Lena affiche « traduction (original) ».
- **Avant la remise** : mettre `ALLOW_UNVALIDATED: false` dans `content/main.js` pour n'utiliser que les termes validés.

## Conformité aux règles du protocole de test
| Règle / critère | Ce que fait le prototype |
|---|---|
| Page normale, sans hook ni `data-i18n` | Lit le DOM tel quel ; aucune dépendance à la page |
| Contenu dynamique | `MutationObserver` : texte ajouté, modifié ou re-rendu → traduit sans rechargement |
| Valeurs financières intactes | Masquage + vérification d'égalité après chaque traduction ; sinon le texte est laissé en français |
| Pas de contresens sur une action financière | Phrases connues seulement ; actions `critical` avec original affiché |
| Alertes de sécurité non affaiblies | Une alerte absente du dictionnaire reste en français |
| Champs de saisie | Valeurs jamais touchées (placeholder et libellés oui) |
| Accessibilité | Clavier complet (Tab, flèches entre onglets, Échap), focus visible, `role`/`aria-*`, zones `aria-live`, contrastes, `prefers-reduced-motion` |
| Thème | Suit automatiquement le thème clair/sombre de l'appareil, y compris si celui-ci change pendant l'utilisation ; le bouton permet une dérogation temporaire, puis de revenir au thème de l'appareil |
| Présentation de l'assistante | Bandeau translucide, bulles espacées et lisibles, suggestions rapides masquées après la première question, halo animé du micro (désactivé si les animations réduites sont demandées) |
| Ne pas collecter / stocker / transmettre les données affichées | Aucune requête réseau, aucun stockage (`permissions: []`), aucune télémétrie |
| Ne pas contourner le parcours / modifier la page | Aucun clic automatique, aucun envoi de formulaire ; seul le texte affiché est remplacé, de façon réversible |

## À déclarer au jury (outils externes)
- **Reconnaissance vocale** : API Web Speech de Chrome et Edge (absente de Firefox : le micro y est désactivé, le champ de texte reste disponible). Chrome envoie l'audio du micro à un service de Google. Elle ne comprend ni duala, ni ewondo, ni fulfulde : la dictée se fait en **français**.
- **Lecture à voix haute** : uniquement les voix **locales** du système (pas de voix réseau). La lecture de page suit les traductions de Lena et les attributs `lang` du site. Si une voix de la langue manque (notamment pour le Duala), une voix française ou anglaise locale peut servir de secours ; la prononciation de ces passages peut alors être approximative. Les enregistrements fournis ne sont pas utilisés automatiquement, car leur transcription n'est pas connue.
- Outils de développement et de conception (Claude, Figma, etc.) : à lister selon ce que vous aurez réellement utilisé.

## Limites connues / à faire
- Les traductions restent partielles : seules les phrases du dictionnaire sont traduites, et les entrées `ok: false` doivent être validées avant la remise.
- L'assistante répond en français ou en anglais selon la langue reconnue. Pour le Duala, elle reconnaît seulement les phrases présentes dans le dictionnaire et demande de répéter en Duala ; des réponses conversationnelles plus riches nécessitent des exemples validés par un locuteur.
- Les demandes de traduction vers l’Ewondo ou le Fulfulde affichent « Cette traduction n'est pas encore disponible sur ce modèle. » au lieu de présenter ces traductions vides comme si elles avaient été faites.
- Pas de détection de la langue parlée (aucune API gratuite ne reconnaît ces langues) : on choisit la langue par le panneau ou par commande (« Traduire en duala »).
- Le « chat intelligent » répond par règles (solde, transfert, frais, explication de page). Un vrai modèle de langue enverrait du texte à un serveur : à éviter ou à déclarer.
- Le bandeau décale la page vers le bas pendant qu'il est affiché (retiré à la fermeture). À vérifier sur l'environnement du jury.
- Tester sur l'environnement officiel : parcours complet des 5 étapes, erreurs, contenu injecté.
