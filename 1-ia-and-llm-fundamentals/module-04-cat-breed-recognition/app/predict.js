// Reuse the previously saved model (no training) and evaluate it against the
// test split. Fails with a clear message if no usable saved model exists.
const { run } = require("./index");

run({ train: false }).catch((error) => {
  console.error(error);
  process.exit(1);
});
