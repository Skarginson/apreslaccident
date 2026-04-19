# Après l'accident — Kickoff Claude Code

Ce document est la **spec de départ** pour démarrer le développement. À garder à la racine du repo (idéalement en tant que `CLAUDE.md`) pour que Claude Code en reparte à chaque session.

---

## 1. Contexte du projet

On construit une application web pour jouer au jeu de rôle solo **Après l'accident** de Nicolas "Gulix" Ronvel (édité par Neoludis, 2025). Le jeu est basé sur le système **LEADS** (Document de Référence Système CC-BY).

**Principe du jeu** : on incarne la survivante d'un accident, isolée dans un endroit mystérieux. On tire une carte par jour (à partir d'un jeu de 52 cartes structuré en 3 actes), on lit un prompt, on écrit une entrée dans son journal. Certaines cartes offrent des "Pistes" thématiques qui, si suivies, modifient le paquet.

L'auteur du jeu a donné son accord explicite pour cette adaptation web.

### Mécanique du jeu (à respecter strictement)

| Enseigne | Rôle |
|---|---|
| **Cœur** | Acte 1 — "Les premiers jours". 13 cartes, **6 tirées** pour le Paquet Histoire. |
| **Carreau** | Acte 2 — "Un endroit mystérieux". 13 cartes, **7 tirées**. |
| **Trèfle** | Acte 3 — "Tout s'emballe". 13 cartes, **6 tirées**. |
| **As de pique** | Fin de la partie. Placé au fond du paquet. |
| **2–10 de pique** | Emplacements pour les 18 Pistes. |
| **Roi / Dame / Valet de pique** | Prompt de blessure initiale + prompt d'épilogue. |

**Paquet Histoire** = 6 cœurs + 7 carreaux + 6 trèfles + As de pique au fond (20 cartes). Les 2–10 de pique sont hors paquet initialement.

**Déroulement** :
1. Le joueur définit un cadre (13 préétablis ou libre).
2. Tirage d'une figure de pique (R/D/V) pour la blessure initiale → première entrée.
3. Boucle quotidienne : tire la carte du dessus du Paquet Histoire, lit le prompt, écrit dans le journal.
4. Certains prompts (environ 25%) offrent 3 **Pistes** (mots-clés). Le joueur peut en suivre une en l'intégrant à sa réponse.
5. **Si la piste suivie n'a jamais été cochée** :
   - Associer la piste à une carte 2–10 de pique libre (choix du joueur).
   - Prendre les 5 cartes du dessus du Paquet Histoire.
   - Y ajouter la carte pique de la piste.
   - Mélanger ces 6 cartes.
   - Remettre l'ensemble au-dessus du Paquet Histoire.
6. Si la piste est déjà cochée, rien de plus.
7. Quand l'**As de pique** sort → fin. Tirage d'une figure de pique pour l'épilogue.

Les **18 pistes** : Amour, Animal, Autel, Calme, Cauchemars, Chaos, Culte, Jouet, Effrayant, Esprit, Famille, Impossible, Lueurs, Mélodie, Message, Mourant, Signal, Vengeance.

---

## 2. Décisions de conception (verrouillées)

- **Stack** : Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui.
- **Persistance v0.1** : IndexedDB via **Dexie.js**. Aucun back-end, aucune auth, aucun Prisma, aucune BDD serveur à ce stade. Les API routes Next.js sont là pour plus tard.
- **Portée v0.1** :
  - Une seule partie active à la fois.
  - Pas de comptes utilisateurs.
  - Relecture des entrées précédentes **pendant** la partie (oui, dès v0.1).
  - Export Markdown uniquement (PDF en v0.2).
- **Design** : très proche de l'esthétique du livre papier (papier vieilli, encre, rouge sourd, typo serif + manuscrit pour le journal). Voir le brief Stitch pour les détails visuels.
- **Licence projet** : open source (MIT pour le code, contenu JSON dérivé sous CC-BY pour respecter LEADS).
- **Pas d'IA générative pour le contenu** : le DRS LEADS l'interdit explicitement, et ce serait contraire à l'esprit du jeu.
- **Pas de gamification** : aucune statistique, aucun badge, aucun score.

---

## 3. Stack détaillée

```
Framework     Next.js 15 (App Router) + React 19 + TypeScript 5 (mode strict)
Styling       Tailwind CSS + shadcn/ui (Radix sous le capot)
État client   Zustand
Persistance   Dexie.js (IndexedDB) côté client uniquement
Validation    Zod pour les schémas
Tests         Vitest (unit) + Playwright (e2e, v0.2)
Lint/format   ESLint (config Next stricte) + Prettier
Package mgr   pnpm
Node          ≥ 20.x
```

**À NE PAS installer à ce stade** : Prisma, NextAuth, Mongoose, Express, tRPC, Jotai, Recoil, Redux, des libs d'animation lourdes (Framer Motion OK si utilisé avec parcimonie).

---

## 4. Structure de fichiers attendue

```
apres-accident/
├── README.md
├── CLAUDE.md                    # ce document
├── LICENSE                      # MIT
├── package.json
├── tsconfig.json                # strict: true, noUncheckedIndexedAccess: true
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
│
├── app/                         # Next.js App Router
│   ├── layout.tsx               # layout global, polices, providers
│   ├── page.tsx                 # accueil
│   ├── about/page.tsx           # À propos du jeu
│   └── game/
│       ├── new/page.tsx         # création de partie (sécurité + cadre + blessure)
│       ├── [id]/page.tsx        # partie en cours (hub)
│       ├── [id]/draw/page.tsx   # tirage + écriture
│       ├── [id]/journal/page.tsx # relecture pendant la partie
│       └── [id]/end/page.tsx    # fin + épilogue + export
│
├── core/                        # logique métier PURE (TS, zéro dépendance React/DOM)
│   ├── types.ts                 # tous les types de domaine
│   ├── deck.ts                  # buildStoryDeck, drawTopCard, insertPisteIntoDeck
│   ├── pistes.ts                # followPiste, availablePisteSlots
│   ├── game.ts                  # createGame, playEntry, concludeGame
│   ├── rng.ts                   # abstraction de Math.random (testable)
│   └── __tests__/
│       ├── deck.test.ts
│       ├── pistes.test.ts
│       └── game.test.ts
│
├── content/                     # données statiques du jeu (JSON)
│   ├── cards/
│   │   ├── hearts.json          # Acte 1, 13 cartes
│   │   ├── diamonds.json        # Acte 2, 13 cartes
│   │   ├── clubs.json           # Acte 3, 13 cartes
│   │   └── spades.json          # figures (R/D/V) pour blessure + épilogue, As pour fin
│   ├── pistes.json              # 18 pistes avec leurs prompts
│   └── frames.json              # 13 cadres préétablis
│
├── lib/
│   ├── storage.ts               # wrapper Dexie (open db, save/load game)
│   ├── export.ts                # game → Markdown
│   └── utils.ts                 # cn() et helpers shadcn
│
├── stores/
│   └── useGameStore.ts          # état Zustand de la partie courante
│
├── components/
│   ├── ui/                      # shadcn (button, dialog, etc.)
│   └── game/
│       ├── PlayingCard.tsx      # rendu d'une carte à jouer
│       ├── DeckStack.tsx        # pile du Paquet Histoire
│       ├── PisteTag.tsx         # étiquette piste
│       ├── JournalEditor.tsx    # zone d'écriture
│       ├── PromptDisplay.tsx    # affichage d'un prompt
│       └── FrameSelector.tsx    # choix du cadre
│
└── public/
    ├── fonts/                   # Lora, Caveat (si self-hosted)
    └── illustrations/           # petits dessins style "livre"
```

---

## 5. Modèle de domaine (TypeScript)

À placer dans `core/types.ts` dès le début. C'est le contrat sur lequel tout repose.

```typescript
// Cartes standards
export type Suit = "heart" | "diamond" | "club" | "spade";
export type Rank = "ace" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "jack" | "queen" | "king";
export type CardId = `${Suit}-${Rank}`;

export interface CardData {
  id: CardId;
  suit: Suit;
  rank: Rank;
  act?: 1 | 2 | 3; // uniquement pour heart/diamond/club
  prompt?: {
    text: string;
    pistes?: readonly [string, string, string];
  };
}

// Les 18 pistes
export type PisteWord =
  | "Amour" | "Animal" | "Autel" | "Calme" | "Cauchemars" | "Chaos"
  | "Culte" | "Jouet" | "Effrayant" | "Esprit" | "Famille" | "Impossible"
  | "Lueurs" | "Mélodie" | "Message" | "Mourant" | "Signal" | "Vengeance";

export interface PisteData {
  word: PisteWord;
  entryText: string; // texte affiché quand la carte pique associée est tirée
}

// Cadres préétablis
export interface Frame {
  id: string;
  title: string;
  description: string;
  customQuestions?: string[]; // questions de personnalisation
}

// État d'une piste dans une partie
export interface PisteState {
  word: PisteWord;
  followed: boolean;
  assignedCardId: CardId | null; // ex. "spade-5" si la piste a été suivie
  excluded: boolean; // retirée par sécurité émotionnelle
}

// Une entrée du journal
export interface Entry {
  id: string;
  dayNumber: number;
  drawnAt: string; // ISO timestamp (date réelle, pas fictive)
  cardId: CardId;
  promptSnapshot: string; // snapshot du texte du prompt au moment du tirage
  pistesOffered: readonly string[] | null;
  pisteFollowed: PisteWord | null;
  journalText: string;
}

// État de la partie
export type GameStatus = "setup" | "playing" | "concluded";

export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: GameStatus;
  frame: {
    type: "preset" | "custom";
    title: string;
    description: string;
    customAnswers?: Record<string, string>;
  };
  survivor?: {
    name?: string;
    notes?: string;
  };
  woundCard: "spade-king" | "spade-queen" | "spade-jack"; // la figure tirée pour la blessure
  epilogueCard: "spade-king" | "spade-queen" | "spade-jack" | null; // tirée à la fin
  storyDeck: CardId[]; // ordre du paquet, [0] = dessus
  discardPile: CardId[]; // cartes tirées
  pistes: PisteState[];
  excludedCards: CardId[]; // cartes retirées par sécurité émotionnelle
  entries: Entry[];
}
```

**Pas de `Date` natif** dans le modèle — toujours des strings ISO. Sérialisation triviale vers IndexedDB.

---

## 6. Structure des fichiers de contenu JSON

### `content/cards/hearts.json`
```json
{
  "act": 1,
  "title": "Les premiers jours",
  "cards": {
    "ace":   { "text": "Vous êtes revenue sur les traces de l'accident. Vous cherchiez quelque chose, mais ne l'avez pas trouvé. Qu'était-ce ? Comment avez-vous réagi ?" },
    "king":  { "text": "Il y a longtemps, quelqu'un vous a donné un conseil. Pourquoi résonne-t-il différemment à vos oreilles aujourd'hui ?" },
    "queen": { "text": "Quelle occupation avez-vous trouvée pour tuer le temps et ne pas tourner en rond ?" },
    "jack":  { "text": "Qu'est-ce qui vous rappelle ce que vous faisiez quelques instants avant l'accident ?" },
    "10":    { "text": "Qu'est-ce qui a remonté votre moral aujourd'hui ?", "pistes": ["Signal", "Jouet", "Animal"] },
    "9":     { "text": "Vous vous réveillez chaque jour en pensant à quelqu'un. À qui ?", "pistes": ["Vengeance", "Amour", "Famille"] },
    "8":     { "text": "Quelque chose vous a réveillée la nuit dernière. De quoi s'agit-il ?", "pistes": ["Mélodie", "Lueurs", "Cauchemars"] },
    "7":     { "text": "Quel vieux souvenir vous est revenu ? Qu'est-ce qui a provoqué ce rappel ?" },
    "6":     { "text": "De quel événement surprenant avez-vous été témoin aujourd'hui ?" },
    "5":     { "text": "Quel rituel quotidien avez-vous mis en place ?" },
    "4":     { "text": "Vous avez établi un campement de fortune. Pourquoi avoir choisi cet endroit ? À quoi ressemble-t-il ?" },
    "3":     { "text": "Comment votre blessure s'est-elle aggravée ?" },
    "2":     { "text": "Vous avez découvert une ressource qui vous est utile. Quelles sont les difficultés pour y accéder ou l'exploiter ?" }
  }
}
```

Même structure pour `diamonds.json` (Acte 2, "Un endroit mystérieux") et `clubs.json` (Acte 3, "Tout s'emballe"). Textes à saisir depuis les pages 15, 16, 17 du livre — je les ai tous dans les fichiers de projet si besoin.

### `content/cards/spades.json`
```json
{
  "ace": {
    "role": "end",
    "text": "L'histoire touche à sa fin."
  },
  "king": {
    "role": "wound_or_epilogue",
    "woundText": "Vous vous êtes blessée lors de l'accident. Paniquez-vous ? Qu'est-ce qui est encore pire que cette blessure ?",
    "epilogueText": "Vous relisez votre journal. Quand l'aviez-vous écrit ? Qu'avez-vous fait et vécu depuis ? Pourquoi avez-vous décidé de le consulter à nouveau ?"
  },
  "queen": {
    "role": "wound_or_epilogue",
    "woundText": "Vous vous êtes légèrement blessée lors de l'accident. Malgré tout, qu'est-ce qui vous donne de l'espoir ? Sur quoi pouvez-vous compter ?",
    "epilogueText": "Ce n'est pas votre journal. Pour cette entrée, vous n'êtes pas la Survivante, mais quelqu'un d'autre. Où avez-vous trouvé ce journal ? Qui est la Survivante et que représente-t-elle pour vous ?"
  },
  "jack": {
    "role": "wound_or_epilogue",
    "woundText": "Vous vous êtes blessée lors de l'accident, mais vous serrez les dents. Qu'avez-vous perdu lors de l'accident ? Quel présage y voyez-vous ?",
    "epilogueText": "Écrivez une dernière page dans votre journal. Ce sera votre dernière page, mais ça, vous ne le savez pas encore."
  }
}
```

### `content/pistes.json`
```json
{
  "pistes": [
    { "word": "Amour", "entryText": "Quelle routine partagée avec votre âme sœur vous manque terriblement ?" },
    { "word": "Animal", "entryText": "Quelle relation avez-vous développée avec l'animal que vous avez rencontré ?" },
    ...
  ]
}
```
Les 18 pistes et leurs prompts sont page 18 et 19 du livre.

### `content/frames.json`
Les 13 cadres préétablis sont pages 20–33 du livre. Chacun = titre, description, associatedCard (optionnel), questions de personnalisation.

---

## 7. Conventions de code

- **TypeScript strict** : `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **Pas de `any`**. Jamais. Si un type est incertain, on utilise `unknown` + validation Zod.
- **Fonctions pures dans `core/`**. Aucune I/O, aucun React, aucun `Math.random` direct (passer par `rng.ts`).
- **Validation au runtime** des données JSON chargées : Zod schema pour chaque type de contenu. Si un fichier de contenu est mal formé, erreur à la compilation ou au chargement, pas silence.
- **Commits** : style conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- **PR impossibles à ce stade** (développeur solo + Claude Code), mais les commits doivent rester atomiques et lisibles.
- **Commentaires** : seulement quand ils expliquent un *pourquoi* non évident. Pas de commentaires qui paraphrasent le code.

---

## 8. Tests à écrire dès le début

Le module `core/` doit être testé avant tout code d'UI. Tests minimum à avoir :

**`deck.test.ts`** :
- `buildStoryDeck` retourne 20 cartes (6+7+6+1).
- Les 6 premières sont des cœurs, les 7 suivantes des carreaux, les 6 suivantes des trèfles, la dernière est l'As de pique.
- Le tirage (seed fixé via `rng.ts`) est reproductible.
- `insertPisteIntoDeck` prend les 5 cartes du dessus, y ajoute la piste, mélange, remet au-dessus. Le paquet a bien +1 carte.
- Si moins de 5 cartes restent, on prend ce qui reste.

**`pistes.test.ts`** :
- `followPiste` coche la piste.
- Si la piste n'était pas cochée, elle devient cochée et reçoit une carte pique libre.
- Si toutes les pistes sont cochées, `availablePisteSlots` retourne `[]`.
- Suivre une piste déjà cochée ne modifie pas le paquet.

**`game.test.ts`** :
- Une partie complète (20 cartes tirées) se termine en status `concluded`.
- Les entrées sont ajoutées dans l'ordre.
- L'As de pique tiré déclenche la fin même s'il sort plus tôt à cause d'une piste.

**Couverture cible** : 90%+ sur `core/`, on ne teste pas l'UI à ce stade.

---

## 9. Premières tâches (session 1)

Dans cet ordre, sans sauter d'étapes :

1. **Init du projet** : `pnpm create next-app` avec TS + Tailwind + App Router. Ajuster les configs (strict TS, ESLint, Prettier).
2. **Installer les dépendances** : `zustand`, `dexie`, `zod`, `vitest`, `@testing-library/react`, shadcn/ui CLI. `pnpm dlx shadcn@latest init`.
3. **Créer l'arborescence** de la section 4 (fichiers vides mais présents).
4. **Écrire `core/types.ts`** tel que spécifié en section 5.
5. **Saisir les JSON de contenu** (`content/`) à partir des textes du livre. Valider avec Zod.
6. **Implémenter `core/deck.ts`** avec tests. C'est la brique la plus importante.
7. **Implémenter `core/pistes.ts`** avec tests.
8. **Implémenter `core/game.ts`** avec tests.
9. **Stop.** On valide le cœur du moteur avant de toucher à l'UI.

**Ne pas commencer l'UI tant que les tests `core/` ne passent pas à 100%.**

---

## 10. Choses importantes à ne pas oublier

- **Le `promptSnapshot` dans `Entry`** : on stocke le texte du prompt au moment du tirage, pas juste un ID. Si on corrige un texte de prompt plus tard, les journaux existants restent cohérents.
- **Les cartes retirées par sécurité émotionnelle** sont exclues du paquet à l'initialisation. On ne change pas les tailles de tirage (on garde 6/7/6) : on tire parmi les cartes non exclues.
- **Les pistes exclues** ne sont pas proposées, même si leur mot apparaît dans un prompt : dans ce cas, on affiche le prompt sans proposer cette piste spécifique.
- **L'insertion d'une piste en fin de partie peut déplacer l'As de pique** : c'est voulu par les règles. `insertPisteIntoDeck` ne traite pas l'As différemment.
- **Une seule partie active** : le store Zustand ne gère qu'une partie à la fois. Si le joueur veut en créer une nouvelle alors qu'une est en cours, on lui propose d'archiver ou d'abandonner l'ancienne avec confirmation.

---

## 11. Références

- Livre *Après l'accident* (Nicolas Ronvel / Neoludis, 2025).
- DRS LEADS v1.1 : https://gulix.itch.io/leads
- Brief design Stitch : `Design_brief_pour_Stitch.md` (dans le repo).
- Document de conception projet : `Projet_Apres_l_accident_v0.md`.

## 12. Crédits à inclure dans le repo et l'app

Dans le `README.md` et la page "À propos" :

> Ce projet est une adaptation web non-commerciale du jeu de rôle solo **Après l'accident** de Nicolas "Gulix" Ronvel, publié par Neoludis en 2025.
>
> L'adaptation est réalisée avec l'accord explicite de l'auteur.
>
> Le système de jeu LEADS (Document de Référence Système v1.1) est utilisé sous licence [Creative Commons Attribution 3.0 Unported](http://creativecommons.org/licenses/by/3.0/). LEADS est une création de Nicolas Ronvel, disponible sur https://gulix.itch.io/leads.
>
> Le code source de cette application est publié sous licence MIT.

---

**Ready to start.** La première tâche concrète est le point 1 de la section 9 : initialiser le projet Next.js.
