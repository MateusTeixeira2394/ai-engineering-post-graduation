// Train a fresh model on the training split, save it to model/, then evaluate
// it against the test split.
const { run } = require("./index");

run({ train: true }).catch((error) => {
  console.error(error);
  process.exit(1);
});
