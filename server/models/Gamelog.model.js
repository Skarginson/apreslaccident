const { Schema, model } = require('mongoose');

const gameLogSchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  player: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    enum: [
      'DRAW_CARD',
      'RESPOND_PROMPT',
      'FOLLOW_PISTE',
      'MOVE_ACT',
      'CONCLUDE_GAME',
    ],
    required: true,
  },
  cardDrawn: {
    type: String,
    required: function () {
      return this.actionType === 'DRAW_CARD';
    },
  },
  promptResponse: {
    type: String,
    required: function () {
      return this.actionType === 'RESPOND_PROMPT';
    },
  },
  pisteFollowed: {
    type: String,
    required: function () {
      return this.actionType === 'FOLLOW_PISTE';
    },
  },
  actNumber: {
    type: Number,
    required: function () {
      return this.actionType === 'MOVE_ACT';
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GameLog = model('GameLog', gameLogSchema);
module.exports = GameLog;
