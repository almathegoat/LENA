// Dictionnaire Duala — À REMPLIR et À FAIRE VALIDER par des locuteurs avant la remise.
// Clé = texte français EXACT affiché sur la page (casse et accents respectés).
//   t        : traduction ({n} = emplacement d'une valeur protégée : montant, numéro, date...)
//   prefix   : true = ne traduit que le DÉBUT du texte (ex. « Bonjour, Amina » → le nom reste intact)
//   ok       : true UNIQUEMENT quand un locuteur a validé le terme
//   critical : true pour une action financière (envoyer, confirmer, annuler...) :
//              Lena affiche alors « traduction (original) » pour éviter tout contresens.
globalThis.Lena = globalThis.Lena || {};
Lena.DICT = Lena.DICT || {};
Lena.DICT.dua = {
  label: "Duala",
  banner: "Démonstration de traduction partielle en Duala",
  phrases: {
    // Exemples tirés de la maquette — vocabulaire à valider :
    "Bonjour": { t: "Idib'a bwam", ok: false, prefix: true },
    "Merci":   { t: "Asé",         ok: false },
    "Oui":     { t: "Ewe",         ok: false },
    "Non":     { t: "Dé",          ok: false }
    // "Effectuer un transfert": { t: "...", ok: false, critical: true },
    // "Confirmer":              { t: "...", ok: false, critical: true },
    // "Annuler":                { t: "...", ok: false, critical: true },
    // "Consulter les frais":    { t: "...", ok: false },
    // "Frais : {n}":            { t: "...", ok: false },   // exemple avec valeur protégée
    // "Solde disponible":       { t: "...", ok: false },
    // "Transactions récentes":  { t: "...", ok: false },
  }
};
