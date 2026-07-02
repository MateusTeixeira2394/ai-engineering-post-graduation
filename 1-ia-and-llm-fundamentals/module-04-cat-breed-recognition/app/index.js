const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs-node");

const DATASET_DIR = path.join(__dirname, "..", "datasets");
const TRAIN_DIR = path.join(DATASET_DIR, "train");
const TEST_DIR = path.join(DATASET_DIR, "test");
const MODEL_DIR = path.join(__dirname, "..", "model");
const MODEL_JSON = path.join(MODEL_DIR, "model.json");
const IMAGE_SIZE = 96; // images are resized to IMAGE_SIZE x IMAGE_SIZE
const CHANNELS = 3; // RGB
const VALIDATION_SPLIT = 0.2;
const EPOCHS = 60;
const BATCH_SIZE = 8;

// -----------------------------------------------------------------------------
// 1. read the image files
// -----------------------------------------------------------------------------
// Each sub-directory of the split (train/ or test/) is a breed (the label). We
// collect the path of every image together with the index of its breed.
function listSamples(splitDir) {
  const breeds = fs
    .readdirSync(splitDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const samples = [];
  breeds.forEach((breed, label) => {
    const breedDir = path.join(splitDir, breed);
    fs.readdirSync(breedDir)
      .filter((file) => /\.(jpe?g|png)$/i.test(file))
      .forEach((file) => {
        samples.push({ file: path.join(breedDir, file), label, breed });
      });
  });

  return { breeds, samples };
}

// -----------------------------------------------------------------------------
// 2. transform the images into tensors
// -----------------------------------------------------------------------------
// Decode each JPEG, resize it to a fixed square and normalize pixels to [0, 1].
function imageToTensor(file) {
  const buffer = fs.readFileSync(file);
  return tf.tidy(() => {
    const decoded = tf.node.decodeImage(buffer, CHANNELS);
    const resized = tf.image.resizeBilinear(decoded, [IMAGE_SIZE, IMAGE_SIZE]);
    return resized.toFloat().div(255);
  });
}

// Build the full feature tensor `xs` and one-hot label tensor `ys`, shuffled so
// the train/validation split contains a mix of every breed.
function buildDataset(samples, numClasses) {
  tf.util.shuffle(samples);

  return tf.tidy(() => {
    const images = samples.map((sample) => imageToTensor(sample.file));
    const labels = samples.map((sample) => sample.label);

    const xs = tf.stack(images);
    const ys = tf.oneHot(tf.tensor1d(labels, "int32"), numClasses);

    // stack() copies the data, so the per-image tensors can be released.
    images.forEach((image) => image.dispose());

    return { xs, ys };
  });
}

// -----------------------------------------------------------------------------
// 3. create the model architecture
// -----------------------------------------------------------------------------
// A small convolutional network: three conv/pool blocks that learn visual
// features, followed by a dense classifier with dropout to fight overfitting on
// this tiny dataset.
function createModel(numClasses) {
  const model = tf.sequential();

  model.add(
    tf.layers.conv2d({
      inputShape: [IMAGE_SIZE, IMAGE_SIZE, CHANNELS],
      filters: 16,
      kernelSize: 3,
      activation: "relu",
      shuffle: true,
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: "relu" }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu" }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.5 }));
  model.add(tf.layers.dense({ units: numClasses, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.adam(1e-3),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

// A saved model is usable only if model.json exists and its weight files are
// present and non-empty. This guards the "run without training" path against a
// missing or half-written model/ directory.
//
// Note: the model/ directory does not have to come from this app's own training
// run. You can drop in a pre-trained model exported from another platform, as
// long as it ends up in TensorFlow.js *Layers* format (model.json + weight
// shards) — that is what the run path loads via tf.loadLayersModel below.
// Compatibility caveats to be aware of:
//   - Google Teachable Machine exports a TF.js Layers model directly, so it
//     drops in without code changes.
//   - Keras models convert cleanly with `tensorflowjs_converter
//     --input_format keras`. A TensorFlow SavedModel (e.g. many SageMaker or
//     Azure Custom Vision exports) converts to a *graph* model instead, which
//     needs tf.loadGraphModel rather than the loadLayersModel call below.
//   - Fully managed black-box services (e.g. AWS Rekognition Custom Labels) do
//     not let you export the weights, so they cannot be used here at all.
//   - Whatever the source, the model only produces correct results if its input
//     preprocessing (IMAGE_SIZE, normalization) and output class order match
//     what this app expects (labels here come from the training split).
function hasSavedModel() {
  if (!fs.existsSync(MODEL_JSON)) return false;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MODEL_JSON, "utf8"));
  } catch {
    return false;
  }

  const weightPaths = (manifest.weightsManifest || []).flatMap(
    (group) => group.paths || []
  );
  if (weightPaths.length === 0) return false;

  return weightPaths.every((relativePath) => {
    const weightFile = path.join(MODEL_DIR, relativePath);
    return fs.existsSync(weightFile) && fs.statSync(weightFile).size > 0;
  });
}

// -----------------------------------------------------------------------------
// train the model on the training split and persist it to disk
// -----------------------------------------------------------------------------
async function trainModel(breeds, samples) {
  const numClasses = breeds.length;
  const { xs, ys } = buildDataset(samples, numClasses);

  const model = createModel(numClasses);
  model.summary();

  await model.fit(xs, ys, {
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    validationSplit: VALIDATION_SPLIT,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `epoch ${String(epoch + 1).padStart(2)} - ` +
          `loss: ${logs.loss.toFixed(4)} acc: ${logs.acc.toFixed(4)} - ` +
          `val_loss: ${logs.val_loss.toFixed(4)} val_acc: ${logs.val_acc.toFixed(4)}`
        );
      },
    },
  });

  // Save the trained model so it can be reused without retraining.
  await model.save(`file://${MODEL_DIR}`);
  console.log(`\nModel saved to ${MODEL_DIR}`);

  xs.dispose();
  ys.dispose();

  return model;
}

// -----------------------------------------------------------------------------
// evaluate a model against the held-out test images it never saw
// -----------------------------------------------------------------------------
async function evaluateModel(model, breeds) {
  const { samples: testSamples } = listSamples(TEST_DIR);
  console.log(`\nTest samples: ${testSamples.length}`);

  let correct = 0;
  for (const example of testSamples) {
    const prediction = tf.tidy(() => {
      const input = imageToTensor(example.file).expandDims(0);
      return model.predict(input);
    });
    const scores = await prediction.data();
    prediction.dispose();

    const predictedLabel = scores.indexOf(Math.max(...scores));
    const predictedBreed = breeds[predictedLabel];
    if (predictedBreed === example.breed) correct += 1;

    const detail = breeds
      .map((breed, index) => `${breed}: ${(scores[index] * 100).toFixed(1)}%`)
      .join(", ");
    const mark = predictedBreed === example.breed ? "✅" : "❌";
    console.log(
      `[${mark}] ${example.breed}/${path.basename(example.file)} -> ` +
      `${predictedBreed} (${detail})`
    );
  }

  console.log(
    `\nTest accuracy: ${correct}/${testSamples.length} ` +
    `(${((correct / testSamples.length) * 100).toFixed(1)}%)`
  );
}

// -----------------------------------------------------------------------------
// entry point: either train a fresh model or reuse the saved one, then evaluate
// -----------------------------------------------------------------------------
async function run({ train = true } = {}) {
  // The breeds (labels) always come from the training split so the label order
  // matches what a saved model was trained with.
  const { breeds, samples } = listSamples(TRAIN_DIR);
  console.log(`Breeds: ${breeds.join(", ")}`);

  let model;
  if (train) {
    console.log(`Training samples: ${samples.length}`);
    model = await trainModel(breeds, samples);
  } else {
    if (!hasSavedModel()) {
      throw new Error(
        `No usable saved model found in ${MODEL_DIR}. ` +
        `Run "npm run train" first to create one.`
      );
    }
    console.log(`Loading saved model from ${MODEL_DIR}`);
    model = await tf.loadLayersModel(`file://${MODEL_JSON}`);
  }

  await evaluateModel(model, breeds);
}

module.exports = { run, hasSavedModel };

// When executed directly (`node app/index.js`) default to training.
if (require.main === module) {
  run({ train: true }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
