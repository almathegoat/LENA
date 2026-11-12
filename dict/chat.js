globalThis.Lena = globalThis.Lena || {};

// Textes du « Chat intelligent » dans chaque langue.
//
// RÈGLE DU PLAN : ces textes sont écrits par des locuteurs natifs, jamais par une IA seule.
//   ok: false = écrit par un 1er locuteur, pas encore relu     ok: true = relu et validé par un 2e locuteur
//
// Phrase à faire traduire (1 seule pour l'instant) :
//   notAvailable → « Cette fonction n'est pas encore disponible sur cette version. »
//
// triggers : quelques mots courts que les gens écrivent dans cette langue (salutations, « merci », « solde »…),
//   donnés par les locuteurs. Ils servent à reconnaître la langue de la question.
//   Sans triggers, Lena prend la langue choisie dans l'onglet « Traduction de page » si la question n'est ni en français ni en anglais.
Lena.chatPacks = {
  allowDraft: true,   // mettre false avant la remise : seuls les textes ok:true sont affichés

  dua: { label: "Duala",    triggers: [], replies: { notAvailable: { t: "", ok: false } } },
  bul: { label: "Bulu",     triggers: [], replies: { notAvailable: { t: "", ok: false } } },
  ewo: { label: "Ewondo",   triggers: [], replies: { notAvailable: { t: "", ok: false } } },
  ful: { label: "Fulfulde", triggers: [], replies: { notAvailable: { t: "", ok: false } } }
};