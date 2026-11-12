// Dictionnaire Duala — Structuré et prêt pour le parcours Safinum Pay (Hackathon SAFINUM)
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
    // ------------------------------------------------------------------------
    // Mots simples / Exemples génériques
    // ------------------------------------------------------------------------
    "Bonjour": { t: "Idib'a bwam", ok: true, prefix: true },
    "Merci":   { t: "Masoma",     ok: true },
    "Oui":     { t: "Eɛ",         ok: true },
    "Non":     { t: "Kɛm",        ok: true },

    // ------------------------------------------------------------------------
    // Barre d'état & En-têtes globales (Header / Stepper)
    // ------------------------------------------------------------------------
    "Environnement de test — données fictives, aucune transaction réelle.": { t: "Muma ma jombɛnɛ — mɛtɛ ma mōni mō̱ pe̱i.", ok: false },
    "Protocole de test": { t: "Mbia ma jombɛnɛ", ok: false },
    "Retour au hackathon": { t: "Timba o hackathon", ok: false },
    "Banque en ligne": { t: "Banka o Internet", ok: false },
    
    "Solde": { t: "Mōni ma tikédi", ok: false },
    "Frais": { t: "Mōni ma mabī", ok: false },
    "Bénéficiaire": { t: "Moto o tuminelno̱", ok: false },
    "Récapitulatif": { t: "Biyedi ma tɛlɛ", ok: false },
    "Confirmation": { t: "Kame̱", ok: false },

    // ------------------------------------------------------------------------
    // ÉTAPE 1 : SOLDE / ACCUEIL
    // ------------------------------------------------------------------------
    "TON COMPTE": { t: "KOUNTA AŊGO̱", ok: false },
    "VOTRE COMPTE": { t: "KOUNTA AŊGO̱", ok: false },
    "Consultez votre solde et lancez un transfert en toute sécurité.": { t: "Biyel mōni ma tikédi o bola denja na muna.", ok: false },
    "SOLDE DISPONIBLE": { t: "MŌNI MA TIKÉDI", ok: false },
    "Solde disponible": { t: "Mōni ma tikédi", ok: false },
    "Numéro de compte :": { t: "Mika ma kounta :", ok: false, prefix: true },
    "Compte courant": { t: "Kounta a mōni", ok: false },

    "Effectuer un transfert": { t: "Bola denja", ok: false, critical: true },
    "Consulter les frais": { t: "Biyel mōni ma mabī", ok: false },

    "TRANSACTIONS RÉCENTES": { t: "MŌNI MA MATITA MA TƐLƐ", ok: false },
    "Paiement marchand": { t: "Feya a mot'a muna", ok: false },
    "Salaire reçu": { t: "Mōni ma musono ma kumi", ok: false },
    "Transfert reçu": { t: "Denja e kumi", ok: false },
    "Facture électricité": { t: "Feya a tɛtɛ electricité", ok: false },

    // ------------------------------------------------------------------------
    // ÉTAPE 2 : FRAIS DE TRANSFERT
    // ------------------------------------------------------------------------
    "FRAIS DE TRANSFERT": { t: "MŌNI MA MABĪ MA DENJA", ok: false },
    "Choisissez le type de transfert et le montant. Les frais sont calculés automatiquement.": { t: "Pwa dǐn la denja na mōni. Mōni ma mabī ma malabwama o tɛlɛ.", ok: false },
    "TYPE D'OPÉRATION": { t: "DǏN LA DENJA", ok: false },
    "Compte Safinum": { t: "Kounta a Safinum", ok: false },
    "Transfert instantané et gratuit": { t: "Denja a nyango̱ a bwa na libre", ok: false },
    "MONTANT À ENVOYER": { t: "MŌNI O PULANO̱ O TUMA", ok: false },
    "Total à débiter": { t: "Mōni ma mawa", ok: false },
    "Solde après opération": { t: "Mōni ma tikédi o pombɛ", ok: false },
    "Gratuit": { t: "Bwa", ok: false },

    // ------------------------------------------------------------------------
    // ÉTAPE 3 : BÉNÉFICIAIRE
    // ------------------------------------------------------------------------
    "Renseignez les informations du destinataire. Vérifiez toujours le numéro avant de valider.": { t: "Tilaedi mɛtɛ ma moto o tuminelno̱. Kengisedi mika ma foon nɛnɛ o pɛtɛ.", ok: false },
    "Ce bénéficiaire n'a jamais été utilisé sur ce compte. Vérifiez le numéro avant de continuer.": { t: "Dǐn la moto tɛ̈ e mo̱ ko̱ndi bolane̱ o kounta mɛnɛ. Kengisedi mika o pɛtɛ.", ok: false },
    "NOM DU BÉNÉFICIAIRE": { t: "DǏN LA MOTO O TUMINELNO̱", ok: false },
    "NUMÉRO DE TÉLÉPHONE": { t: "MIKA MA FOON", ok: false },
    "MOTIF DU TRANSFERT": { t: "NJÉ O TUMINELNO̱", ok: false },
    "Paiement de services": { t: "Feya a boleki", ok: false },
    "NOTE (OPTIONNEL)": { t: "TILAEDI (PETE)", ok: false },
    "J'ai vérifié le nom et le numéro du bénéficiaire.": { t: "Na kengisedi dǐn na mika ma foon.", ok: false },

    // ------------------------------------------------------------------------
    // ÉTAPE 4 : RÉCAPITULATIF
    // ------------------------------------------------------------------------
    "Vérifiez les informations avant de confirmer le transfert.": { t: "Biyel mɛtɛ mɛnɛ o pɛtɛ o kame̱ denja.", ok: false },
    "Montant": { t: "Mōni", ok: false },
    "Référence": { t: "Référence", ok: false },
    "Opération": { t: "Boledikɛ", ok: false },
    "Je confirme que les informations ci-dessus sont correctes.": { t: "Na kame̱ te̱ mɛtɛ mɛnɛ e pɔ̱ te̱i.", ok: false },

    // Actions critiques (Boutons)
    "Continuer": { t: "Bange̱le̱", ok: false, critical: true },
    "Retour": { t: "Timba", ok: false },
    "Modifier": { t: "Tucke̱", ok: false },
    "Confirmé": { t: "Kame̱i", ok: false, critical: true },
    "Confirmant": { t: "Kame̱ne̱", ok: false, critical: true },
    "Confirmer le transfert": { t: "Kame̱ denja", ok: false, critical: true },
    "Nouveau transfert": { t: "Denja e pe̱te̱", ok: false, critical: true },

    // ------------------------------------------------------------------------
    // ÉTAPE 5 : CONFIRMATION & SUCCÈS
    // ------------------------------------------------------------------------
    "Transfert effectué": { t: "Denja e bolani bwam", ok: false },
    "Votre transfert a été envoyé avec succès.": { t: "Denja aŋgo̱ e tumineli na muna.", ok: false },
    "Statut": { t: "Tɛlɛ", ok: false },
    "Succès": { t: "Bwam", ok: false },

    // ------------------------------------------------------------------------
    // GESTION DES ERREURS & SÉCURITÉ (Panneau Latéral / Banner)
    // ------------------------------------------------------------------------
    "Une erreur est survenue": { t: "Bwesɛ e kumi", ok: false },
    "Vous devez confirmer les informations avant de valider le transfert.": { t: "Ango o kame̱ mɛtɛ o pɛtɛ o tuma denja.", ok: false },
    
    "Sécurité": { t: "Muna", ok: false },
    "Vérifiez toujours le nom et le numéro du bénéficiaire avant de confirmer un transfert.": { t: "Biyedi mɛtɛ ma moto na foon o pɛtɛ o kame̱ denja.", ok: false },
    "Connexion sécurisée": { t: "Muna ma mɛtɛ", ok: false }
  }
};