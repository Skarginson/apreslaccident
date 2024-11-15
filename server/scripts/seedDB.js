const mongoose = require('mongoose');
const Card = require('../models/Card.model.js');
const Piste = require('../models/Piste.model.js');
const connectDB = require('../config/db.js');

const cards = [
  {
    suit: 'Coeur',
    rank: 'As',
    prompt:
      'Vous êtes revenu sur les traces de l’accident. Que cherchiez-vous ? Comment avez-vous réagi en ne le retrouvant pas ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: 'Roi',
    prompt:
      'Il y a longtemps, quelqu’un vous a adressé un conseil. Pourquoi résonne-t-il différemment à vos oreilles aujourd’hui ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: 'Dame',
    prompt:
      'Quelle occupation avez-vous trouvé pour tuer le temps et ne pas tourner en rond ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: '10',
    prompt: 'Qu’est-ce qui a remonté votre moral aujourd’hui ?',
    act: 1,
    isPisteCard: true,
    pistes: ['Signal', 'Jouet', 'Animal'],
  },
  {
    suit: 'Coeur',
    rank: '9',
    prompt: 'Vous vous réveillez chaque jour en pensant à quelqu’un. A qui ?',
    act: 1,
    isPisteCard: true,
    pistes: ['Vengeance', 'Amour', 'Famille'],
  },
  {
    suit: 'Coeur',
    rank: '8',
    prompt:
      'Quelque chose vous a réveillé la nuit dernière. De quoi s’agit-il ?',
    act: 1,
    isPisteCard: true,
    pistes: ['Mélodie', 'Lueurs', 'Cauchemars'],
  },
  {
    suit: 'Coeur',
    rank: '7',
    prompt:
      'Racontez ce vieux souvenir qui s’est rappelé à votre mémoire. Qu’est-ce qui a provoqué ce rappel ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: '6',
    prompt: 'De quel événement surprenant avez-vous été témoin aujourd’hui ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: '5',
    prompt: 'Quel rituel quotidien avez-vous mis en place ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: '4',
    prompt:
      'Vous avez établi un campement de fortune. Pourquoi avoir choisi cet endroit ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: '3',
    prompt: 'Comment votre blessure s’est-elle aggravée ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Coeur',
    rank: '2',
    prompt:
      'Vous avez découvert une ressource intéressante. Quelles sont les difficultés pour y accéder ?',
    act: 1,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: 'As',
    prompt:
      'Vous avez trouvé un endroit qui vous avait échappé jusqu’ici. Qu’a-t-il de particulier ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: 'Roi',
    prompt:
      'Vous vous êtes fabriqué un objet inutile. Quels souvenirs cela a-t-il fait remonter ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: 'Dame',
    prompt:
      'Quelle légende aviez-vous entendu à propos de cet endroit ? Comment cela s’est-il confronté à la réalité de l’endroit ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: 'Valet',
    prompt:
      'Pourquoi êtes-vous précipitamment revenu à votre campement aujourd’hui ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: '10',
    prompt: 'Vous avez fait une drôle de rencontre. Racontez-la',
    act: 2,
    isPisteCard: true,
    pistes: ['Esprit', 'Animal', 'Mourant'],
  },
  {
    suit: 'Carreau',
    rank: '9',
    prompt: 'Sur quelles traces êtes-vous tombé ?',
    act: 2,
    isPisteCard: true,
    pistes: ['Message', 'Autel', 'Animal'],
  },
  {
    suit: 'Carreau',
    rank: '8',
    prompt:
      'Vous n’êtes pas seul ici. Qu’avez-vous aperçu, et pourquoi être resté caché ?',
    act: 2,
    isPisteCard: true,
    pistes: ['Impossible', 'Vengeance', 'Culte'],
  },
  {
    suit: 'Carreau',
    rank: '7',
    prompt: 'Qu’est-ce qui vous fait vous sentir mieux aujourd’hui ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: '6',
    prompt: 'Un détail de l’accident vous est revenu en mémoire. Décrivez-le.',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: '5',
    prompt:
      'Quelque chose de trivial vous manque terriblement aujourd’hui. Qu’est-ce ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: '4',
    prompt:
      'Vous avez fabriqué une arme aujourd’hui. Comment, mais surtout pourquoi ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: '3',
    prompt:
      'Quel moyen de subsistance avez-vous à votre disposition ? Pour combien de jours encore ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Carreau',
    rank: '2',
    prompt:
      'En relisant votre journal, vous remarquez que vous n’avez pas relaté quelque chose de manière inconsciente. Qu’est-ce que cela vous fait ?',
    act: 2,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: 'As',
    prompt: 'Vous n’avez rien écrit dans votre journal hier. Pourquoi ?',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: 'Roi',
    prompt:
      'Qu’avez-vous fait pour indiquer votre position aux secours ? Pourquoi devez-vous y consacrer du temps chaque jour ?',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: 'Dame',
    prompt:
      'Vous avez égaré un objet important à vos yeux. Comment avez-vous réagi ? L’avez-vous retrouvé ?',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: 'Valet',
    prompt: 'Pourquoi quitter cet endroit devient-il subitement une urgence ?',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: '10',
    prompt: 'Qu’est-ce qui a subitement changé dans l’environnement ?',
    act: 3,
    isPisteCard: true,
    pistes: ['Calme', 'Chaos', 'Effrayant'],
  },
  {
    suit: 'Trèfle',
    rank: '9',
    prompt: 'Pourquoi avez-vous dû quitter votre campement en toute hâte ?',
    act: 3,
    isPisteCard: true,
    pistes: ['Animal', 'Mélodie', 'Signal'],
  },
  {
    suit: 'Trèfle',
    rank: '8',
    prompt:
      'Qu’est-ce qui vous fait douter de la réalité, de ce que vous avez vécu ces derniers jours ?',
    act: 3,
    isPisteCard: true,
    pistes: ['Esprit', 'Autel', 'Impossible'],
  },
  {
    suit: 'Trèfle',
    rank: '7',
    prompt:
      'Aujourd’hui, vous pensez à quelqu’un. Écrivez-lui un message, au cas où on retrouverait votre journal.',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: '6',
    prompt:
      'Il y a quelque chose qui semble vous retenir ici. Décrivez ce sentiment, cette sensation.',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: '5',
    prompt:
      'Une fois parti d’ici, quel changement radical allez-vous faire dans votre vie d’avant ?',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: '4',
    prompt: "Qu'est-ce qui vous amène à croire que les secours sont proches ?",
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: '3',
    prompt: 'Qu’est-ce qui vous manquera en partant d’ici ?',
    act: 3,
    isPisteCard: false,
  },
  {
    suit: 'Trèfle',
    rank: '2',
    prompt: 'Quel est ce danger permanent qui vous menace ?',
    act: 3,
    isPisteCard: false,
  },
];

const pistes = [
  {
    name: 'Amour',
    description:
      'Quelle routine partagée avec votre âme sœur vous manque terriblement ?',
  },
  {
    name: 'Animal',
    description:
      'Quelle relation avez-vous développée avec l’animal rencontré ?',
  },
  {
    name: 'Calme',
    description:
      'La tranquillité de ces derniers jours vous a rappelé un souvenir heureux. Décrivez-le.',
  },
  {
    name: 'Autel',
    description: 'Qu’avez-vous trouvé d’utile et/ou d’étrange dans l’autel ?',
  },
  {
    name: 'Cauchemars',
    description:
      'Vous avez vu quelque chose issu de vos cauchemars. En quoi est-ce troublant de voir ça ici ?',
  },
  {
    name: 'Chaos',
    description:
      "Le chaos de ces derniers jours a libéré un passage. L'avez-vous exploré ? Qu'y a-t-il derrière ?",
  },
  {
    name: 'Culte',
    description:
      'Vous êtes tombé sur un lieu sacré. Qu’y avez découvert de fascinant ?',
  },
  {
    name: 'Jouet',
    description:
      'Quel souvenir remonte quand vous manipulez le jouet que vous avez trouvé ?',
  },
  {
    name: 'Effrayant',
    description:
      'Vous avez craint pour votre vie. Racontez comment vous avez cru vos derniers instants arrivés.',
  },
  {
    name: 'Esprit',
    description: 'L’esprit vous a recontacté. Vers où vous a-t-il guidé ?',
  },
  {
    name: 'Famille',
    description:
      'Comment imaginez-vous que votre famille vivra votre disparition si vous ne revenez jamais ?',
  },
  {
    name: 'Impossible',
    description:
      'Qu’avez-vous découvert qui défie la réalité ? De quel événement commencez-vous à douter maintenant ?',
  },
  {
    name: 'Lueurs',
    description:
      'Chaque nuit, les lueurs se rapprochent de vous. Qu’avez-vous découvert en allant vers elles ?',
  },
  {
    name: 'Mélodie',
    description:
      'Vous avez trouvé la source de la mélodie. De quoi s’agit-il ?',
  },
  {
    name: 'Message',
    description:
      'Vous avez découvert d’autres messages. Que vous racontent-ils sur cet endroit ?',
  },
  {
    name: 'Mourant',
    description:
      'Aujourd’hui vous avez mis en terre quelqu’un de vos propres mains. En quoi était-ce plus facile que la première fois ?',
  },
  {
    name: 'Signal',
    description:
      'Vous avez trouvé un moyen d’envoyer un signal vers ailleurs. Décrivez comment.',
  },
  {
    name: 'Vengeance',
    description:
      'Qu’est-ce qui vous amène à penser que vous n’êtes peut-être pas ici par hasard ?',
  },
];

async function seedDatabase() {
  try {
    // Connexion à MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Vider les collections existantes
    await Card.deleteMany();
    await Piste.deleteMany();
    console.log('Existing data cleared...');

    // Insérer les pistes et récupérer les documents insérés
    const insertedPistes = await Piste.insertMany(pistes);
    console.log('Pistes inserted successfully');

    // Créer une map associant chaque nom de piste à son ObjectId
    const pisteMap = {};
    insertedPistes.forEach((piste) => {
      pisteMap[piste.name] = piste._id;
    });

    // Mettre à jour les cartes avec les ObjectId des pistes
    const updatedCards = cards.map((card) => {
      if (card.isPisteCard) {
        card.pistes = card.pistes.map((pisteName) => pisteMap[pisteName]);
      }
      return card;
    });

    // Insérer les cartes mises à jour
    await Card.insertMany(updatedCards);
    console.log('Cards inserted successfully');

    // Fermer la connexion à MongoDB
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error connecting to MongoDB or inserting data:', error);
    process.exit(1);
  }
}

seedDatabase();
