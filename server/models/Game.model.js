const { Schema, model } = require('mongoose');

const gameSchema = new Schema({
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED'],
    default: 'IN_PROGRESS',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  setupFrame: {
    keyElements: {
      accident: {
        type: String,
        required: true,
      },
      isolatedPlace: {
        type: String,
        required: true,
      },
      loneSurvivor: {
        type: String,
        required: true,
      },
      possibleRescue: {
        type: String,
        required: true,
      },
    },
  },
});

const Game = model('Game', gameSchema);
module.exports = Game;
