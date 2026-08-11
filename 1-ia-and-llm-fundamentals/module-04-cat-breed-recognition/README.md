# Cat Breed Recognition

A convolutional neural network (CNN) that classifies a cat photo into one of four breeds, built with **TensorFlow.js** running on Node. It reads images straight from disk, turns them into tensors, trains a small CNN from scratch, saves it, and evaluates it against a held-out test set.

The four breeds it recognizes: **abyssinian**, **balinese**, **maine_coon**, **persian**.

## Project Structure

```
module-04-cat-breed-recognition/
├── app/
│   ├── index.js     # all the logic: load images, build model, train, evaluate
│   ├── train.js     # entry point → train a fresh model, then evaluate
│   └── predict.js   # entry point → load the saved model, then evaluate
├── datasets/
│   ├── train/       # training images, one sub-folder per breed (the label)
│   │   ├── abyssinian/  balinese/  maine_coon/  persian/
│   └── test/        # held-out images the model never sees during training
│       ├── abyssinian/  balinese/  maine_coon/  persian/
├── model/           # saved model (model.json + weights.bin) — gitignored
└── package.json
```

The dataset is tiny on purpose — roughly 20–30 images per breed for training and 3–5 per breed for testing. It is a teaching exercise, not a production-grade dataset. The **folder name is the label**: every image inside `datasets/train/persian/` is a persian.

## Technologies Used

- **[@tensorflow/tfjs-node](https://www.npmjs.com/package/@tensorflow/tfjs-node)** — TensorFlow.js with the native (C++) backend for Node, which makes training and image decoding fast. Provides tensors, layers, the training loop (`model.fit`), and JPEG/PNG decoding (`tf.node.decodeImage`).
- **Node.js** (`>=18 <23`) with the built-in `fs` and `path` modules to walk the dataset directories and read image bytes.
- **`@tensorflow-models/mobilenet`** is listed as a dependency but is **not used** by the current code — the model here is trained from scratch rather than via transfer learning.

## Setup and Run

1. Install dependencies:
   ```
   npm install
   ```

2. Train a fresh model (writes it to `model/`), then evaluate against the test set:
   ```
   npm run train
   ```

3. Reuse the already-saved model without retraining, and evaluate:
   ```
   npm run predict
   ```

`npm start` is equivalent to `npm run train` (it runs `app/index.js` directly, which defaults to training).

> Note: `model/` is gitignored, so on a fresh clone you must run `npm run train` at least once before `npm run predict` will work — otherwise it fails with a clear "No usable saved model found" message.

## How It Works

All logic lives in [app/index.js](app/index.js). The two entry points ([train.js](app/train.js) and [predict.js](app/predict.js)) are one-liners that call the same `run({ train })` function with a different flag. The pipeline is:

```
list images ─► images → tensors ─► build CNN ─► fit (train) ─► save ─► evaluate on test set
                                        │
                          (predict mode skips train, loads saved model instead)
```

### 1. Listing the samples

[`listSamples(splitDir)`](app/index.js#L21-L39) reads a split directory (`train/` or `test/`), treats every sub-directory as a **breed / label**, and collects every `.jpg`/`.jpeg`/`.png` file inside it. Breeds are **sorted alphabetically** so the label order is deterministic — this matters because the model's output neurons are tied to that order.

It returns:
- `breeds` — the ordered list of class names, e.g. `["abyssinian", "balinese", "maine_coon", "persian"]`
- `samples` — one `{ file, label, breed }` per image, where `label` is the numeric index of the breed (`0–3`)

The labels always come from the **training** split, even in predict mode, so a saved model's output order stays consistent with how it was trained.

### 2. Turning images into tensors

A neural network only accepts numbers, so each image is converted into a tensor by [`imageToTensor(file)`](app/index.js#L45-L52):

1. Read the raw file bytes with `fs.readFileSync`.
2. `tf.node.decodeImage(buffer, 3)` decodes the JPEG/PNG into a `[height, width, 3]` tensor (3 = RGB channels).
3. `tf.image.resizeBilinear(..., [96, 96])` resizes every image to a fixed **96×96** square, so they all share the same shape regardless of their original dimensions.
4. `.toFloat().div(255)` normalizes pixel values from `0–255` into `0–1`, which keeps the gradients well-scaled during training.

Everything runs inside `tf.tidy()` so intermediate tensors are freed automatically.

[`buildDataset(samples, numClasses)`](app/index.js#L56-L71) then assembles the whole dataset into two big tensors:

- `xs` — every image stacked into shape `[numSamples, 96, 96, 3]` (the **features**)
- `ys` — the labels as a **one-hot** matrix of shape `[numSamples, numClasses]`, e.g. label `2` → `[0, 0, 1, 0]`

The samples are **shuffled first** (`tf.util.shuffle`) so that when training later carves off a validation slice, that slice contains a mix of every breed rather than, say, all persians.

### 3. The model architecture

[`createModel(numClasses)`](app/index.js#L79-L111) builds a small sequential CNN — three convolution/pooling blocks that learn visual features, followed by a dense classifier:

| Layer | Output idea | Details |
| --- | --- | --- |
| `conv2d` | 16 feature maps | 3×3 kernel, `relu`, input `[96, 96, 3]` |
| `maxPooling2d` | downsample ×2 | 2×2 pool |
| `conv2d` | 32 feature maps | 3×3 kernel, `relu` |
| `maxPooling2d` | downsample ×2 | 2×2 pool |
| `conv2d` | 64 feature maps | 3×3 kernel, `relu` |
| `maxPooling2d` | downsample ×2 | 2×2 pool |
| `flatten` | 1D vector | flattens the feature maps |
| `dense` | 64 units | `relu` |
| `dropout` | regularization | drops 50% of activations while training |
| `dense` | `numClasses` units | `softmax` → probability per breed |

- **Convolution layers** slide small filters across the image to detect visual patterns (edges → textures → shapes), getting progressively more abstract deeper in the network.
- **Max-pooling** shrinks each feature map by keeping the strongest activation in every 2×2 window, which reduces computation and adds a little translation tolerance.
- **`relu`** (`max(0, x)`) adds non-linearity so the network can learn complex combinations of features.
- **Dropout at 0.5** randomly zeroes half the dense activations during training. With only ~100 training images the model would otherwise memorize them; dropout forces it to learn more robust features and fights overfitting.
- **`softmax`** on the final layer turns the raw scores into probabilities that sum to 1, one per breed.

It compiles with the **Adam** optimizer (learning rate `1e-3`), **categorical cross-entropy** loss (the standard choice for one-hot multi-class classification), and tracks **accuracy**.

> Minor quirk: the first `conv2d` is passed `shuffle: true`, which is not a valid option for a conv layer and is silently ignored — shuffling actually happens via the `shuffle: true` passed to `model.fit`.

### 4. Training

[`trainModel(breeds, samples)`](app/index.js#L157-L188) builds the dataset, creates the model, prints `model.summary()`, and calls `model.fit` with:

- `epochs: 60` — the full dataset is passed through 60 times
- `batchSize: 8` — weights update after every 8 images
- `validationSplit: 0.2` — the last 20% of the (already shuffled) samples is held out to measure `val_loss` / `val_acc` each epoch
- `shuffle: true` — reshuffle each epoch

An `onEpochEnd` callback logs training vs. validation loss and accuracy per epoch, which is what lets you watch for overfitting (training accuracy climbing while validation accuracy stalls). After training, the model is saved to disk with `model.save('file://.../model')`, producing `model.json` (architecture + weight manifest) and `weights.bin` (the actual weights).

### 5. Predict mode — reusing a saved model

When run with `{ train: false }` (via `npm run predict`), [`run`](app/index.js#L229-L251) skips training and loads the saved model with `tf.loadLayersModel`.

Before loading, [`hasSavedModel()`](app/index.js#L133-L152) validates that the save is actually usable: `model.json` must exist and parse, and **every** weight file it references must exist and be non-empty. This guards the no-training path against a missing or half-written `model/` directory, failing early with a helpful message instead of a cryptic crash.

The code also documents that the `model/` directory doesn't have to come from this app — you can drop in a pre-trained model exported from elsewhere (e.g. Google Teachable Machine, or a converted Keras model) **as long as** it's in TensorFlow.js *Layers* format and its input preprocessing (96×96, `/255`) and output class order match what this app expects. See the extended comment in [app/index.js](app/index.js#L114-L132) for the compatibility caveats.

### 6. Evaluation

[`evaluateModel(model, breeds)`](app/index.js#L193-L224) runs the model over every image in `datasets/test/` — images it never saw during training — and, for each one:

1. Converts the image to a tensor and adds a batch dimension (`.expandDims(0)`).
2. Runs `model.predict` to get the per-breed probabilities.
3. Picks the breed with the highest score as the prediction.
4. Prints a line with ✅/❌, the true breed, the predicted breed, and the full probability breakdown.

Finally it prints overall **test accuracy** (correct / total). Example output line:

```
[✅] persian/0090.jpg -> persian (abyssinian: 2.1%, balinese: 8.3%, maine_coon: 5.0%, persian: 84.6%)
```

## Notes & Caveats

- **Very small dataset.** With ~20–30 images per breed, results will be noisy and accuracy can swing a lot between training runs. This is expected — the point is to understand the full CNN pipeline end to end, not to reach production accuracy.
- **From scratch, not transfer learning.** The network is trained from random weights. For a dataset this small, transfer learning (e.g. fine-tuning MobileNet, already a dependency) would normally give far better results with less data.
- **Everything loads into memory at once.** `buildDataset` stacks all images into a single tensor, which is fine at this scale but would not work for a large dataset — that would need a streaming `tf.data` pipeline.
