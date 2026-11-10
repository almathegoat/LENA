// Dictionnaire Fulfulde — À REMPLIR et À FAIRE VALIDER par des locuteurs avant la remise.
// Clé = texte français EXACT affiché sur la page (casse et accents respectés).
//   t        : traduction ({n} = emplacement d'une valeur protégée : montant, numéro, date...)
//   prefix   : true = ne traduit que le DÉBUT du texte (ex. « Bonjour, Amina » → le nom reste intact)
//   ok       : true UNIQUEMENT quand un locuteur a validé le terme
//   critical : true pour une action financière (envoyer, confirmer, annuler...) :
//              Lena affiche alors « traduction (original) » pour éviter tout contresens.
globalThis.Lena = globalThis.Lena || {};
Lena.DICT = Lena.DICT || {};
Lena.DICT.ful = {
  label: "Fulfulde",
  banner: "Démonstration de traduction partielle en Fulfulde",
  phrases: {
    // "Bonjour": { t: "...", ok: false },
    // "Merci":   { t: "...", ok: false },
    // "Oui":     { t: "...", ok: false },
    // "Non":     { t: "...", ok: false }
  }
};
