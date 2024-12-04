const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const { PORT, CORS_ORIGIN } = require('./consts');
const authRouter = require('./routes/auth.routers');
const gameRouter = require('./routes/game.routers');
const cardRouter = require('./routes/card.routers');
const pisteRouter = require('./routes/piste.routers');
const gameLogRouter = require('./routes/gamelog.routers');

const { catchAll, errorHandler } = require('./error-handling');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({ origin: CORS_ORIGIN }));

// Routes principales
app.use('/auth', authRouter);
app.use('/games', gameRouter);
app.use('/cards', cardRouter);
app.use('/pistes', pisteRouter);
app.use('/games/:gameId/logs', gameLogRouter);

// Gestion des erreurs
app.use(catchAll);
app.use(errorHandler);

// Connexion à la base de données
require('./config/db')();

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});

module.exports = app;
