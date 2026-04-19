# Après l'accident — Web App

Adaptation web non-commerciale du jeu de rôle solo **Après l'accident** de Nicolas "Gulix" Ronvel (Neoludis, 2025), réalisée avec l'accord explicite de l'auteur.

Dans ce jeu, vous incarnez la survivante d'un accident, isolée dans un endroit mystérieux. Chaque jour, vous tirez une carte, lisez un prompt et écrivez une entrée dans votre journal.

---

## Stack

| Outil | Version |
|---|---|
| Next.js (App Router) | 16 |
| React | 19 |
| TypeScript | 5 (strict) |
| Tailwind CSS | 4 |
| shadcn/ui | latest |
| Zustand | 5 |
| Dexie.js (IndexedDB) | 4 |
| Zod | 4 |
| Vitest | 4 |
| pnpm | 10 |

Aucun back-end, aucune authentification, aucune donnée transmise hors du navigateur. La persistance est intégralement locale (IndexedDB).

---

## Lancer le projet

```bash
pnpm install
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Tests

```bash
pnpm test            # run (one-shot)
pnpm test:watch      # watch mode
pnpm test:coverage   # avec rapport de couverture
```

Les tests couvrent le moteur de jeu (`core/`) à 90 %+. L'UI n'est pas testée en v0.1.

---

## Structure du projet

```
core/          Logique métier pure (deck, pistes, game) — zéro dépendance React
content/       Données statiques JSON (cartes, pistes, cadres)
app/           Pages Next.js (App Router)
components/    Composants React (ui/ shadcn, game/ spécifiques)
lib/           Persistance (Dexie), export Markdown, utilitaires
stores/        État global Zustand
```

---

## Mécanique du jeu

Le **Paquet Histoire** contient 20 cartes : 6 cœurs (Acte 1) + 7 carreaux (Acte 2) + 6 trèfles (Acte 3) + l'As de pique au fond.

**Boucle quotidienne** :
1. Tirer la carte du dessus du Paquet Histoire.
2. Lire le prompt et écrire une entrée de journal.
3. Certains prompts proposent 3 **Pistes** (mots-clés thématiques). En suivre une pour la première fois insère une carte de pique supplémentaire dans le paquet.
4. Quand l'As de pique sort → la partie se termine, tirage d'une figure pour l'épilogue.

Les 18 pistes : Amour, Animal, Autel, Calme, Cauchemars, Chaos, Culte, Effrayant, Esprit, Famille, Impossible, Jouet, Lueurs, Mélodie, Message, Mourant, Signal, Vengeance.

---

## Crédits

Ce projet est une adaptation web non-commerciale du jeu de rôle solo **Après l'accident** de Nicolas "Gulix" Ronvel, publié par Neoludis en 2025.

L'adaptation est réalisée avec l'accord explicite de l'auteur.

Le système de jeu LEADS (Document de Référence Système v1.1) est utilisé sous licence [Creative Commons Attribution 3.0 Unported](http://creativecommons.org/licenses/by/3.0/). LEADS est une création de Nicolas Ronvel, disponible sur [https://gulix.itch.io/leads](https://gulix.itch.io/leads).

Le code source de cette application est publié sous licence **MIT**.
