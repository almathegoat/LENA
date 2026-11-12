# Récapitulatif du projet LENA

## Présentation

LENA est une extension de navigateur conçue comme assistante vocale et outil de traduction partielle de pages web en langues camerounaises. Elle fonctionne principalement côté navigateur, sans serveur applicatif ni modèle de langage.

## Fonctionnalités réalisées

### Extension et interface

- Extension déclarée pour Chrome et Firefox dans `manifest.json`.
- Injection de l’assistante sur les pages HTTP, HTTPS et les pages locales autorisées par le navigateur.
- Ouverture depuis l’icône de la barre d’outils, le bouton flottant ou le raccourci `Alt + Maj + L`.
- Panneau LENA avec trois onglets : Assistant vocal, Traduction de page et Chat intelligent.
- Interface intégrée dans un Shadow DOM pour isoler ses styles de ceux du site.
- Thème clair ou sombre suivant les préférences de l’appareil, avec possibilité de forcer temporairement l’autre thème.
- Commandes accessibles au clavier, libellés accessibles et états annoncés par des zones de statut.

### Traduction de page

- Traduction locale, effectuée à partir de dictionnaires embarqués, sans appel réseau.
- Dictionnaires prévus pour le Duala, l’Ewondo et le Fulfulde.
- Le dictionnaire Duala accepte des expressions françaises et anglaises comme textes sources et les associe à des traductions Duala.
- Correspondance sur des phrases connues : les textes absents du dictionnaire restent dans leur langue d’origine.
- Traduction des textes visibles et de certains attributs d’interface (`placeholder`, `title`, `aria-label`, `alt`).
- Surveillance des changements du DOM pour traiter également des contenus ajoutés après le chargement.
- Restauration du texte d’origine lorsque la traduction est désactivée ou remplacée.
- Affichage de l’original à côté de certaines traductions financières sensibles.

### Protection des données affichées

- Montants, nombres, dates, références et numéros sont masqués temporairement pendant les substitutions du dictionnaire.
- Les valeurs protégées sont réinsérées et vérifiées après traduction ; si leur intégrité n’est pas garantie, le remplacement est abandonné.
- Les champs de saisie et les sous-arbres sensibles ou non pertinents (scripts, styles, code, etc.) sont exclus de la traduction.
- Le mécanisme de lecture du solde observe le texte visible sans cliquer, modifier ou envoyer de données dans le site.

### Assistant vocal et lecture de page

- Réponses locales par règles pour des demandes courantes : solde, transferts, frais, sécurité, aide et résumé de page.
- Lecture à voix haute à partir des voix locales disponibles dans le navigateur.
- Fonction « Lire toute la page » dans l’onglet Assistant vocal, avec commande pour arrêter la lecture.
- Lecture limitée au texte visible de la page, en excluant l’interface LENA et les éléments masqués ou non textuels.
- Découpage du texte en segments pour permettre la lecture de pages longues.
- Choix de la voix selon les langues déclarées par la page et les textes traduits par LENA ; une voix française ou anglaise de secours peut être utilisée si la langue n’a pas de voix locale.
- Avertissement lorsque cette voix de secours peut entraîner une prononciation approximative, notamment pour le Duala.
- Lecture du solde avec son montant écrit en toutes lettres, plutôt que la lecture brute des chiffres.

### Reconnaissance vocale

- Utilisation de l’API de reconnaissance vocale disponible dans le navigateur pour saisir une question à la voix.
- La reconnaissance est configurée en français ; sa disponibilité dépend du navigateur et de ses services vocaux.
- Un champ de saisie reste disponible si la dictée vocale ne l’est pas.

### Langue des réponses

- Réponses prévues en français ou en anglais selon la langue reconnue dans le message.
- Les entrées Duala du dictionnaire servent à reconnaître certains messages Duala.
- En l’absence de réponses conversationnelles Duala validées, LENA demande de répéter le message en Duala au lieu d’inventer une réponse.

## Organisation des principaux fichiers

| Fichier | Rôle |
|---|---|
| `manifest.json` | Configuration de l’extension, permissions et ordre de chargement des scripts. |
| `background.js` | Relais du clic sur l’icône de l’extension et indication de l’état ouvert/fermé. |
| `content/main.js` | Initialisation de LENA et raccourci clavier. |
| `content/ui.js` | Construction de l’interface, gestion des onglets, traduction, conversation et lecture de page. |
| `content/ui-styles.js` | Styles de l’interface. |
| `content/theme.js` | Thème clair/sombre et commande de changement de thème. |
| `content/assistant.js` | Réponses par règles, détection de langue, dictée et synthèse vocale. |
| `content/balance.js` | Repérage et lecture du solde sur la page, avec conversion des montants en mots français. |
| `content/translator.js` | Traduction locale du DOM et observation du contenu dynamique. |
| `content/protect.js` | Masquage et vérification des valeurs sensibles pendant les traductions. |
| `dict/duala.js` | Expressions sources et traductions Duala, en français et en anglais. |
| `dict/ewondo.js`, `dict/fulfulde.js` | Dictionnaires prévus pour l’Ewondo et le Fulfulde. |
| `dict/chat.js` | Emplacement prévu pour les phrases de conversation validées dans les langues camerounaises. |
| `test/test-page.html` | Page locale de démonstration avec solde, données de compte et contenu dynamique. |
| `voice duala/` | Enregistrements audio Duala fournis pour le projet. |

## Limites et suites à prévoir

- La traduction est partielle : elle dépend des entrées exactes contenues dans les dictionnaires.
- Les entrées du dictionnaire sont marquées `ok: false` tant qu’elles n’ont pas été validées par des locuteurs ; la configuration de développement autorise actuellement leur utilisation.
- Les dictionnaires Ewondo et Fulfulde sont encore largement vides.
- Le pack de réponses conversationnelles Duala est vide : une conversation complète en Duala demande des formulations et réponses fournies puis validées par des locuteurs.
- Les fichiers audio Duala ne sont pas reliés automatiquement à des textes, car leur transcription n’est pas documentée ; ils ne sont donc pas assemblés pour lire du texte arbitraire.
- La qualité de prononciation dépend des voix locales installées. Une voix de secours française ou anglaise peut mal prononcer le Duala.
- La reconnaissance vocale en français peut transmettre l’audio à un service du navigateur ; elle n’est pas entièrement locale.
- L’extension travaille dans le cadre permis par le navigateur : certaines pages internes ou protégées ne peuvent pas recevoir le script de l’extension.

## Vérifications effectuées pendant les changements

- Vérification de syntaxe JavaScript avec `node --check` sur les scripts concernés.
- Vérification du JSON de `manifest.json`.
- Tests ciblés de traduction française et anglaise vers le Duala et de conservation des numéros protégés.
- Tests ciblés de lecture vocale : sélection des voix, lecture de segments successifs, gestion des voix absentes et découpage des textes longs.

## Travaux à terminer avant les tests finaux

### les logos du projets 

- augmenter celui qui est au niveau des extensions car il est trop petit
- diminuer celui qui permet d'entrer  dans l'application

### Dictionnaires et périmètre linguistique

- Compléter le dictionnaire Duala avec les expressions réellement présentes sur le site de test, en français et en anglais, puis faire relire les traductions par un locuteur Duala.
- Vérifier les traductions des libellés, messages d'erreur, étapes de transfert et textes dynamiques ; les phrases absentes du dictionnaire resteront dans leur langue d'origine.
- Décider du périmètre de la version finale pour l’Ewondo et le Fulfulde. Si ces langues ne sont pas prêtes, retirer ou désactiver leurs choix dans l’onglet Traduction ; sinon, remplir leurs dictionnaires et faire valider les entrées avant de les proposer.
- Compléter les exemples de messages et de réponses Duala avec des formulations fournies et validées par des locuteurs. Pour l’instant, la reconnaissance Duala est limitée aux expressions déjà présentes dans le dictionnaire et l’assistante demande de répéter le message.
- Ne passer `ALLOW_UNVALIDATED` à `false` qu’après avoir marqué `ok: true` les entrées relues qui doivent être disponibles en mode final.
- Identifier et transcrire les fichiers du dossier `voice duala/` avant de les relier à des phrases. Sans transcription, ils ne permettent pas de composer la lecture de textes arbitraires.
- changer la voix de l'assistante vocale  afin que le ton duala soit plus auditive et respecté
- Faire en sorte que lorsque l'utilisateur utilise le micro que l'assistante puisse identifier langue qu'il utilise (francais ,anglais,duala) et puisse lui répondre en cette langue 
- faire en sorte que mmême  en écris l'assistante puisse repondre à la question demandée en la langue utilisée 

### Vérifications fonctionnelles et manuelles

- Recharger l’extension et les pages de test après les dernières modifications ; vérifier l’installation dans chaque navigateur officiellement visé.
- Tester la traduction français → Duala et anglais → Duala, y compris les textes non répertoriés, les attributs de formulaire, le contenu ajouté après le chargement et le retour à l’original.
- Vérifier que les montants, numéros, dates et références ne changent pas, et que les actions financières sensibles continuent d’afficher leur texte d’origine conformément aux règles du dictionnaire.
- Tester les commandes de l’assistante en français, en anglais et avec les formulations Duala validées ; vérifier la langue de la réponse et signaler les demandes non reconnues sans inventer de traduction.
- Tester la lecture de page sur du contenu français, anglais et traduit en Duala : voix locales disponibles ou manquantes, voix de secours, pages longues, arrêt de lecture et page sans texte visible.
- Vérifier le bouton de la barre d’outils, le bouton flottant, le raccourci clavier, les onglets, les messages d’erreur et le thème clair/sombre.
- Faire un dernier contrôle des protections de confidentialité : aucune transmission du contenu de page par la traduction locale ; informer les testeurs que la dictée vocale du navigateur peut envoyer l’audio à son service de reconnaissance.

- 