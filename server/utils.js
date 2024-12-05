function handleNotFound(res) {
  res.status(404).json({ message: 'Resource Not Found!' });
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

module.exports = { handleNotFound, shuffleArray };
