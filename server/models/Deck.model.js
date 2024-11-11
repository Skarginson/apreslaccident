const { Schema, model } = require('mongoose');

const deckSchema = new Schema({
  acts: [
    {
      actNumber: Number,
      cards: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Card',
        },
      ],
    },
  ],
  currentAct: {
    type: Number,
    default: 1,
  },
  pisteCards: [
    {
      card: {
        type: Schema.Types.ObjectId,
        ref: 'Card',
      },
    },
  ],
  finalCard: {
    type: Schema.Types.ObjectId,
    ref: 'Card',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Deck = model('Deck', deckSchema);
module.exports = Deck;
